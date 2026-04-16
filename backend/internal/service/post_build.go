package service

import (
	"strconv"
	"strings"
	"time"

	"flux/backend/internal/models"
)

func buildPost(req PostRequest) models.Post {
	post := models.Post{}
	applyPostRequest(&post, req)
	if post.Slug == "" {
		post.Slug = "post-" + strconv.FormatInt(time.Now().UnixNano(), 10)
	}
	if post.Status == "" {
		post.Status = "draft"
	}
	if post.Published.IsZero() {
		post.Published = time.Now()
	}
	return post
}

func applyPostRequest(post *models.Post, req PostRequest) {
	post.Title = first(req.Title, "未命名文章")
	if strings.TrimSpace(req.Slug) != "" {
		post.Slug = strings.TrimSpace(req.Slug)
	}
	post.Category = first(req.Category, "随笔")
	post.Color = first(req.Color, "primary")
	post.Excerpt = first(req.Excerpt, "这是一篇新的草稿。")
	post.Content = first(req.Content, post.Excerpt)
	post.ReadTime = estimateReadTime(post.Content)
	post.Image = req.Image
	post.Featured = req.Featured
	post.Reverse = req.Reverse
	post.Status = first(req.Status, "draft")
}

func first(value, fallback string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	return value
}

func estimateReadTime(content string) string {
	text := strings.TrimSpace(content)
	if text == "" {
		return "1 分钟阅读"
	}
	runes := []rune(text)
	minutes := (len(runes) + 499) / 500
	if minutes < 1 {
		minutes = 1
	}
	return strconv.Itoa(minutes) + " 分钟阅读"
}
