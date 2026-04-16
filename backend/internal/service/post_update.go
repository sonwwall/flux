package service

import (
	"time"

	"flux/backend/internal/models"
)

func (s *Service) UpdatePost(id uint, req PostRequest) (models.Post, error) {
	post, err := s.dao.GetPostByID(id)
	if err != nil {
		return post, err
	}
	applyPostRequest(&post, req)
	if post.Published.IsZero() {
		post.Published = time.Now()
	}
	if post.Status == "published" {
		if err := validatePublish(post); err != nil {
			return post, err
		}
	}
	return post, s.dao.SavePost(&post)
}
