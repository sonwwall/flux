package handler

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"flux/backend/internal/media"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

const maxUploadSize = 20 << 20

var allowedImageTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

var allowedAudioTypes = map[string]string{
	"audio/mpeg":  ".mp3",
	"audio/mp3":   ".mp3",
	"audio/ogg":   ".ogg",
	"audio/wav":   ".wav",
	"audio/x-wav": ".wav",
	"audio/wave":  ".wav",
}

func (h *Handler) UploadImage(ctx context.Context, c *app.RequestContext) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "missing image file"})
		return
	}
	if file.Size > maxUploadSize {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "image must be smaller than 20MB"})
		return
	}

	contentType := strings.ToLower(file.Header.Get("Content-Type"))
	ext, ok := allowedImageTypes[contentType]
	if !ok {
		ext = strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".gif" {
			c.JSON(consts.StatusBadRequest, map[string]string{"error": "unsupported image type"})
			return
		}
		if ext == ".jpeg" {
			ext = ".jpg"
		}
	}

	if err := os.MkdirAll(media.ImageDir(), 0o755); err != nil {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "create upload directory failed"})
		return
	}

	name := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), randomSuffix(), ext)
	dst := filepath.Join(media.ImageDir(), name)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "save image failed"})
		return
	}

	path := "/uploads/images/" + name
	c.JSON(consts.StatusOK, map[string]string{
		"url":      uploadOrigin(c) + path,
		"path":     path,
		"filename": name,
	})
}

func (h *Handler) UploadAudio(ctx context.Context, c *app.RequestContext) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "missing audio file"})
		return
	}
	if file.Size > maxUploadSize {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "audio must be smaller than 20MB"})
		return
	}

	contentType := strings.ToLower(file.Header.Get("Content-Type"))
	ext, ok := allowedAudioTypes[contentType]
	if !ok {
		ext = strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".mp3" && ext != ".ogg" && ext != ".wav" {
			c.JSON(consts.StatusBadRequest, map[string]string{"error": "unsupported audio type"})
			return
		}
	}

	if err := os.MkdirAll(media.AudioDir(), 0o755); err != nil {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "create upload directory failed"})
		return
	}

	name := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), randomSuffix(), ext)
	dst := filepath.Join(media.AudioDir(), name)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "save audio failed"})
		return
	}

	path := "/uploads/audio/" + name
	c.JSON(consts.StatusOK, map[string]string{
		"url":      uploadOrigin(c) + path,
		"path":     path,
		"filename": name,
	})
}

func uploadOrigin(c *app.RequestContext) string {
	if origin := strings.TrimRight(os.Getenv("UPLOAD_PUBLIC_ORIGIN"), "/"); origin != "" {
		return origin
	}
	return requestOrigin(c)
}

func requestOrigin(c *app.RequestContext) string {
	scheme := string(c.URI().Scheme())
	if scheme == "" {
		scheme = "http"
	}
	host := string(c.Host())
	if host == "" {
		host = "127.0.0.1:8080"
	}
	return scheme + "://" + host
}

func randomSuffix() string {
	buf := make([]byte, 4)
	if _, err := rand.Read(buf); err != nil {
		return "image"
	}
	return hex.EncodeToString(buf)
}
