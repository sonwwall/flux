package dao

import "flux/backend/internal/models"

func (d *Dao) GetAuthor() (models.AuthorProfile, error) {
	var author models.AuthorProfile
	return author, d.db.First(&author).Error
}
