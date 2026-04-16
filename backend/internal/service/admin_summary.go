package service

import "flux/backend/internal/models"

func (s *Service) AdminSummary() (models.AdminSummary, error) {
	return s.dao.AdminSummary()
}
