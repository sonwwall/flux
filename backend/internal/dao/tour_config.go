package dao

import "flux/backend/internal/models"

func (d *Dao) GetTourConfig() (models.TourConfig, error) {
	var cfg models.TourConfig
	return cfg, d.db.First(&cfg).Error
}

func (d *Dao) UpdateTourConfig(cfg *models.TourConfig) error {
	return d.db.Save(cfg).Error
}
