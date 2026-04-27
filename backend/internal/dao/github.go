package dao

import (
	"flux/backend/internal/models"
	"gorm.io/gorm"
)

func (d *Dao) GetGitHubSnapshot(username string) (models.GitHubSnapshot, error) {
	var snapshot models.GitHubSnapshot
	err := d.db.Where("login = ?", username).First(&snapshot).Error
	return snapshot, err
}

func (d *Dao) SaveGitHubSnapshot(snapshot *models.GitHubSnapshot) error {
	var existing models.GitHubSnapshot
	err := d.db.Where("login = ?", snapshot.Login).First(&existing).Error
	if err == nil {
		snapshot.ID = existing.ID
		snapshot.CreatedAt = existing.CreatedAt
		return d.db.Save(snapshot).Error
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}
	return d.db.Create(snapshot).Error
}
