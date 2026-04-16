package service

import "flux/backend/internal/models"

func (s *Service) GetAuthor() (models.AuthorProfile, error) {
	return s.dao.GetAuthor()
}
