package service

import "flux/backend/internal/models"

func (s *Service) ListTags() ([]models.Tag, error) {
	return s.dao.ListTags()
}
