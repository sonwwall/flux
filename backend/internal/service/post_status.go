package service

import (
	"errors"
	"time"

	"flux/backend/internal/models"
)

func (s *Service) UpdatePostStatus(id uint, status string) (models.Post, error) {
	if status != "published" && status != "draft" {
		return models.Post{}, errors.New("status must be published or draft")
	}
	post, err := s.dao.GetPostByID(id)
	if err != nil {
		return post, err
	}
	post.Status = status
	if status == "published" {
		if err := validatePublish(post); err != nil {
			return post, err
		}
		post.Published = time.Now()
	}
	return post, s.dao.SavePost(&post)
}
