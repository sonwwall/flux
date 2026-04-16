package dao

import (
	"time"

	"flux/backend/internal/models"
)

func (d *Dao) AdminSummary() (models.AdminSummary, error) {
	var summary models.AdminSummary
	if err := d.db.Model(&models.Post{}).Count(&summary.Posts).Error; err != nil {
		return summary, err
	}
	if err := d.db.Model(&models.Post{}).Where("status = ?", "draft").Count(&summary.Drafts).Error; err != nil {
		return summary, err
	}
	if err := d.db.Model(&models.Tag{}).Count(&summary.Tags).Error; err != nil {
		return summary, err
	}
	monthStart := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	err := d.db.Model(&models.Post{}).Where("published >= ?", monthStart).Count(&summary.MonthPosts).Error
	return summary, err
}
