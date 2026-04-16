package service

import "flux/backend/internal/models"

func (s *Service) UpdateAuthor(author *models.AuthorProfile) error {
	return s.dao.UpdateAuthor(author)
}
