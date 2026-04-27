package service

import (
	"strings"

	"flux/backend/internal/models"
)

type TourTagRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
}

type TourPageRequest struct {
	Badge       string           `json:"badge"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Tags        []TourTagRequest `json:"tags"`
}

type TourPageResponse struct {
	Badge       string       `json:"badge"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Tags        []models.Tag `json:"tags"`
}

func (s *Service) UpdateTourPage(req TourPageRequest) (TourPageResponse, error) {
	cfg, err := s.dao.GetTourConfig()
	if err != nil {
		return TourPageResponse{}, err
	}

	cfg.Badge = first(req.Badge, "标签云")
	cfg.Title = first(req.Title, "内容索引")
	cfg.Description = first(req.Description, "通过标签快速进入不同主题。")

	tags := make([]models.Tag, 0, len(req.Tags))
	seen := map[string]struct{}{}
	for index, item := range req.Tags {
		name := strings.TrimSpace(item.Name)
		if name == "" {
			return TourPageResponse{}, ValidationError("标签名称不能为空")
		}
		if _, ok := seen[name]; ok {
			return TourPageResponse{}, ValidationError("标签名称不能重复")
		}
		seen[name] = struct{}{}
		tags = append(tags, models.Tag{
			Name:        name,
			Description: first(item.Description, "未填写标签说明"),
			Count:       len(req.Tags) - index,
			Icon:        first(item.Icon, "sell"),
			Color:       first(item.Color, "primary"),
		})
	}

	if err := s.dao.UpdateTourConfig(&cfg); err != nil {
		return TourPageResponse{}, err
	}
	if err := s.dao.ReplaceTags(tags); err != nil {
		return TourPageResponse{}, err
	}

	return TourPageResponse{
		Badge:       cfg.Badge,
		Title:       cfg.Title,
		Description: cfg.Description,
		Tags:        tags,
	}, nil
}
