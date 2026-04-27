package service

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"

	"flux/backend/internal/models"
)

const githubSyncInterval = 30 * time.Minute
const githubSnapshotTTL = time.Hour

type githubProfileResponse struct {
	Login       string `json:"login"`
	Name        string `json:"name"`
	Bio         string `json:"bio"`
	AvatarURL   string `json:"avatar_url"`
	HTMLURL     string `json:"html_url"`
	PublicRepos int    `json:"public_repos"`
	Followers   int    `json:"followers"`
	Following   int    `json:"following"`
}

type githubRepoResponse struct {
	ID              int64     `json:"id"`
	Name            string    `json:"name"`
	Description     string    `json:"description"`
	HTMLURL         string    `json:"html_url"`
	Language        string    `json:"language"`
	StargazersCount int       `json:"stargazers_count"`
	ForksCount      int       `json:"forks_count"`
	Fork            bool      `json:"fork"`
	Private         bool      `json:"private"`
	PushedAt        time.Time `json:"pushed_at"`
}

func (s *Service) GetGitHubSnapshot(ctx context.Context) (models.GitHubSnapshot, error) {
	author, err := s.dao.GetAuthor()
	if err != nil {
		return models.GitHubSnapshot{}, err
	}

	username := extractGitHubUsername(author.Github)
	if username == "" {
		return models.GitHubSnapshot{}, nil
	}

	snapshot, err := s.dao.GetGitHubSnapshot(username)
	if err == nil && time.Since(snapshot.SyncedAt) < githubSnapshotTTL {
		return snapshot, nil
	}

	fresh, fetchErr := s.FetchAndSaveGitHubSnapshot(ctx, username)
	if fetchErr == nil {
		return fresh, nil
	}
	if err == nil {
		return snapshot, nil
	}
	return models.GitHubSnapshot{}, fetchErr
}

func (s *Service) FetchAndSaveGitHubSnapshot(ctx context.Context, username string) (models.GitHubSnapshot, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return models.GitHubSnapshot{}, nil
	}

	profile, err := fetchGitHubJSON[githubProfileResponse](ctx, "https://api.github.com/users/"+url.PathEscape(username))
	if err != nil {
		return models.GitHubSnapshot{}, err
	}
	reposPayload, err := fetchGitHubJSON[[]githubRepoResponse](ctx, "https://api.github.com/users/"+url.PathEscape(username)+"/repos?sort=updated&per_page=100&type=owner")
	if err != nil {
		return models.GitHubSnapshot{}, err
	}

	sort.SliceStable(reposPayload, func(i, j int) bool {
		return reposPayload[i].PushedAt.After(reposPayload[j].PushedAt)
	})

	repos := make([]models.GitHubRepoSnapshot, 0, min(len(reposPayload), 4))
	totalStars := 0
	for _, repo := range reposPayload {
		totalStars += repo.StargazersCount
		if len(repos) < 4 {
			repos = append(repos, models.GitHubRepoSnapshot{
				ID:              repo.ID,
				Name:            repo.Name,
				Description:     repo.Description,
				HTMLURL:         repo.HTMLURL,
				Language:        repo.Language,
				StargazersCount: repo.StargazersCount,
				ForksCount:      repo.ForksCount,
				Fork:            repo.Fork,
				Private:         repo.Private,
				PushedAt:        repo.PushedAt,
			})
		}
	}

	activity := buildGitHubActivity(reposPayload)
	snapshot := models.GitHubSnapshot{
		Login:         profile.Login,
		Name:          profile.Name,
		Bio:           profile.Bio,
		AvatarURL:     profile.AvatarURL,
		HTMLURL:       profile.HTMLURL,
		PublicRepos:   profile.PublicRepos,
		Followers:     profile.Followers,
		Following:     profile.Following,
		TotalStars:    totalStars,
		Activity:      activity,
		ActivityDelta: activityDelta(activity),
		Repos:         repos,
		SyncedAt:      time.Now(),
	}
	if snapshot.Login == "" {
		snapshot.Login = username
	}
	if err := s.dao.SaveGitHubSnapshot(&snapshot); err != nil {
		return snapshot, err
	}
	return snapshot, nil
}

func (s *Service) StartGitHubSync(ctx context.Context) {
	go func() {
		timer := time.NewTimer(2 * time.Second)
		defer timer.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-timer.C:
				author, err := s.dao.GetAuthor()
				if err == nil {
					if username := extractGitHubUsername(author.Github); username != "" {
						syncCtx, cancel := context.WithTimeout(ctx, 12*time.Second)
						_, _ = s.FetchAndSaveGitHubSnapshot(syncCtx, username)
						cancel()
					}
				}
				timer.Reset(githubSyncInterval)
			}
		}
	}()
}

func fetchGitHubJSON[T any](ctx context.Context, endpoint string) (T, error) {
	var zero T
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return zero, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "flux-blog-github-cache")
	if token := strings.TrimSpace(os.Getenv("GITHUB_TOKEN")); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	resp, err := client.Do(req)
	if err != nil {
		return zero, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return zero, errors.New("github request failed: " + resp.Status)
	}
	if err := json.NewDecoder(resp.Body).Decode(&zero); err != nil {
		return zero, err
	}
	return zero, nil
}

func extractGitHubUsername(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	parsed, err := url.Parse(value)
	if err == nil && parsed.Host != "" {
		if !strings.EqualFold(strings.TrimPrefix(parsed.Host, "www."), "github.com") {
			return ""
		}
		parts := strings.Split(strings.Trim(parsed.Path, "/"), "/")
		if len(parts) > 0 {
			return parts[0]
		}
		return ""
	}
	return strings.Trim(strings.TrimPrefix(value, "@"), "/")
}

func buildGitHubActivity(repos []githubRepoResponse) []int {
	now := time.Now()
	activity := make([]int, 6)
	for _, repo := range repos {
		if repo.PushedAt.IsZero() {
			continue
		}
		for index := 0; index < 6; index++ {
			month := now.AddDate(0, index-5, 0)
			if repo.PushedAt.Year() == month.Year() && repo.PushedAt.Month() == month.Month() {
				activity[index]++
			}
		}
	}
	return activity
}

func activityDelta(activity []int) int {
	if len(activity) < 2 {
		return 0
	}
	previous := activity[len(activity)-2]
	current := activity[len(activity)-1]
	if previous == 0 {
		if current > 0 {
			return 100
		}
		return 0
	}
	return ((current - previous) * 100) / previous
}
