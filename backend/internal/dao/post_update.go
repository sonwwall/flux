package dao

import "flux/backend/internal/models"

func (d *Dao) SavePost(post *models.Post) error {
	return d.db.Save(post).Error
}
