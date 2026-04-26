package service

import "flux/backend/internal/models"

func (s *Service) GetTourConfig() (models.TourConfig, error) {
	return s.dao.GetTourConfig()
}

func (s *Service) UpdateTourConfig(cfg *models.TourConfig) error {
	return s.dao.UpdateTourConfig(cfg)
}
