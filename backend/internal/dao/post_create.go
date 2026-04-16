package dao

import "flux/backend/internal/models"

func (d *Dao) CreatePost(post *models.Post) error {
	return d.db.Create(post).Error
}
