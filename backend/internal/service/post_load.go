package service

import "flux/backend/internal/models"

func (s *Service) ListPosts(query string, includeDrafts bool) ([]models.Post, error) {
	return s.dao.ListPosts(query, includeDrafts)
}

func (s *Service) ListAdminPosts() ([]models.Post, error) {
	return s.dao.ListAdminPosts()
}

func (s *Service) GetPostBySlug(slug string) (models.Post, error) {
	return s.dao.GetPostBySlug(slug)
}
