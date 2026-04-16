package dao

import "flux/backend/internal/models"

func (d *Dao) DeletePost(id uint) error {
	return d.db.Delete(&models.Post{}, id).Error
}
