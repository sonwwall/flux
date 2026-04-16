package service

import "flux/backend/internal/models"

func (s *Service) GetSiteConfig() (models.SiteConfig, error) {
	return s.dao.GetSiteConfig()
}

func (s *Service) UpdateSiteConfig(cfg *models.SiteConfig) error {
	return s.dao.UpdateSiteConfig(cfg)
}
