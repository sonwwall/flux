package dao

import (
	"flux/backend/internal/models"
	"gorm.io/gorm"
)

func (d *Dao) ReplaceTags(tags []models.Tag) error {
	return d.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Tag{}).Error; err != nil {
			return err
		}
		if len(tags) == 0 {
			return nil
		}
		return tx.Create(&tags).Error
	})
}
