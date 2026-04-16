package dao

import "flux/backend/internal/models"

func (d *Dao) GetSiteConfig() (models.SiteConfig, error) {
	var cfg models.SiteConfig
	return cfg, d.db.First(&cfg).Error
}

func (d *Dao) UpdateSiteConfig(cfg *models.SiteConfig) error {
	return d.db.Save(cfg).Error
}
