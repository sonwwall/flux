package service

import "flux/backend/internal/models"

func (s *Service) CreatePost(req PostRequest) (models.Post, error) {
	post := buildPost(req)
	if post.Status == "published" {
		if err := validatePublish(post); err != nil {
			return post, err
		}
	}
	return post, s.dao.CreatePost(&post)
}
