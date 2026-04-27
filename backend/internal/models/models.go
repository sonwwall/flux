package models

import "time"

type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"size:180;not null" json:"title"`
	Slug      string    `gorm:"size:180;uniqueIndex;not null" json:"slug"`
	Category  string    `gorm:"size:40;index;not null" json:"category"`
	Color     string    `gorm:"size:32;not null;default:primary" json:"color"`
	Excerpt   string    `gorm:"size:512;not null" json:"excerpt"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ReadTime  string    `gorm:"size:40;not null" json:"readTime"`
	Image     string    `gorm:"size:1024" json:"image"`
	Featured  bool      `gorm:"index" json:"featured"`
	Reverse   bool      `json:"reverse"`
	Status    string    `gorm:"size:24;index;not null;default:draft" json:"status"`
	Published time.Time `gorm:"index" json:"published"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Tag struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:60;uniqueIndex;not null" json:"name"`
	Description string    `gorm:"size:160;not null" json:"description"`
	Count       int       `gorm:"not null;default:0" json:"count"`
	Icon        string    `gorm:"size:60;not null" json:"icon"`
	Color       string    `gorm:"size:32;not null;default:primary" json:"color"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type TourConfig struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Badge       string    `gorm:"size:60;not null" json:"badge"`
	Title       string    `gorm:"size:160;not null" json:"title"`
	Description string    `gorm:"size:512;not null" json:"description"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type AuthorNote struct {
	Label string `json:"label"`
	Title string `json:"title"`
	Body  string `json:"body"`
}

type AuthorProfile struct {
	ID           uint         `gorm:"primaryKey" json:"id"`
	Name         string       `gorm:"size:80;not null" json:"name"`
	Handle       string       `gorm:"size:80;not null" json:"handle"`
	Role         string       `gorm:"size:80;not null" json:"role"`
	Bio          string       `gorm:"size:512;not null" json:"bio"`
	Avatar       string       `gorm:"size:1024" json:"avatar"`
	Github       string       `gorm:"size:160" json:"github"`
	Twitter      string       `gorm:"size:160" json:"twitter"`
	Contact      string       `gorm:"size:160" json:"contact"`
	NoteSubtitle string       `gorm:"size:160" json:"noteSubtitle"`
	Notes        []AuthorNote `gorm:"serializer:json" json:"notes"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type AdminSummary struct {
	Posts      int64 `json:"posts"`
	Drafts     int64 `json:"drafts"`
	Tags       int64 `json:"tags"`
	MonthPosts int64 `json:"monthPosts"`
}

type GitHubRepoSnapshot struct {
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

type GitHubSnapshot struct {
	ID            uint                 `gorm:"primaryKey" json:"id"`
	Login         string               `gorm:"size:80;uniqueIndex;not null" json:"login"`
	Name          string               `gorm:"size:120" json:"name"`
	Bio           string               `gorm:"size:512" json:"bio"`
	AvatarURL     string               `gorm:"size:1024" json:"avatar_url"`
	HTMLURL       string               `gorm:"size:1024" json:"html_url"`
	PublicRepos   int                  `json:"public_repos"`
	Followers     int                  `json:"followers"`
	Following     int                  `json:"following"`
	TotalStars    int                  `json:"total_stars"`
	Activity      []int                `gorm:"serializer:json" json:"activity"`
	ActivityDelta int                  `json:"activity_delta"`
	Repos         []GitHubRepoSnapshot `gorm:"serializer:json" json:"repos"`
	SyncedAt      time.Time            `json:"synced_at"`
	CreatedAt     time.Time            `json:"createdAt"`
	UpdatedAt     time.Time            `json:"updatedAt"`
}

type SiteConfig struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	HeroTitle            string    `gorm:"size:200" json:"heroTitle"`
	HeroSubtitle         string    `gorm:"size:200" json:"heroSubtitle"`
	HeroDesc             string    `gorm:"size:512" json:"heroDesc"`
	HeroImage            string    `gorm:"size:1024" json:"heroImage"`
	LandingGradientStart string    `gorm:"size:32" json:"landingGradientStart"`
	LandingGradientEnd   string    `gorm:"size:32" json:"landingGradientEnd"`
	LandingGlow          string    `gorm:"size:64" json:"landingGlow"`
	MusicPlaceholder     string    `gorm:"size:512" json:"musicPlaceholder"`
	AudioSrc             string    `gorm:"size:1024" json:"audioSrc"`
	CardTags             string    `gorm:"size:256" json:"cardTags"`
	CodeBlockContent     string    `gorm:"type:text" json:"codeBlockContent"`
	SplashEyebrow        string    `gorm:"size:160" json:"splashEyebrow"`
	SplashTitle          string    `gorm:"size:160" json:"splashTitle"`
	SplashSubtitle       string    `gorm:"size:160" json:"splashSubtitle"`
	SplashDesc           string    `gorm:"size:512" json:"splashDesc"`
	SplashEnter          string    `gorm:"size:160" json:"splashEnter"`
	AdminSecret          string    `gorm:"size:128;not null;default:'flux-admin'" json:"-"`
	UpdatedAt            time.Time `json:"updatedAt"`
}
