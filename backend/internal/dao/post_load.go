package dao

import (
	"strings"

	"flux/backend/internal/models"
)

func (d *Dao) ListPosts(query string, includeDrafts bool) ([]models.Post, error) {
	var posts []models.Post
	tx := d.db.Order("published desc")
	if query = strings.TrimSpace(query); query != "" {
		like := "%" + query + "%"
		tx = tx.Where("title LIKE ? OR excerpt LIKE ? OR category LIKE ?", like, like, like)
	}
	if !includeDrafts {
		tx = tx.Where("status = ?", "published")
	}
	return posts, tx.Find(&posts).Error
}

func (d *Dao) ListAdminPosts() ([]models.Post, error) {
	var posts []models.Post
	return posts, d.db.Order("updated_at desc").Find(&posts).Error
}

func (d *Dao) GetPostBySlug(slug string) (models.Post, error) {
	var post models.Post
	return post, d.db.Where("slug = ?", slug).First(&post).Error
}

func (d *Dao) GetPostByID(id uint) (models.Post, error) {
	var post models.Post
	return post, d.db.First(&post, id).Error
}
