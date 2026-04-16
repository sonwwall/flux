package dao

import "flux/backend/internal/models"

func (d *Dao) UpdateAuthor(author *models.AuthorProfile) error {
	return d.db.Save(author).Error
}
