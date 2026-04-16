package service

import (
	"strings"

	"flux/backend/internal/models"
)

func validatePublish(post models.Post) error {
	if strings.TrimSpace(post.Title) == "" || post.Title == "未命名文章" {
		return ValidationError("发布前必须填写标题")
	}
	if len([]rune(strings.TrimSpace(post.Excerpt))) < 12 {
		return ValidationError("发布前摘要至少需要 12 个字符")
	}
	if len([]rune(strings.TrimSpace(post.Content))) < 20 {
		return ValidationError("发布前正文至少需要 20 个字符")
	}
	return nil
}
