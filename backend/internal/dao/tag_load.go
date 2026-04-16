package dao

import "flux/backend/internal/models"

func (d *Dao) ListTags() ([]models.Tag, error) {
	var tags []models.Tag
	return tags, d.db.Order("count desc").Find(&tags).Error
}
