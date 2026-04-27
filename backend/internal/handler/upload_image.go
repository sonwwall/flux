package handler

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"sort"
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

type AudioFile struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Size     int64  `json:"size"`
	Modified string `json:"modified"`
}

type renameAudioRequest struct {
	OldName string `json:"oldName"`
	NewName string `json:"newName"`
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

func (h *Handler) ListAudio(ctx context.Context, c *app.RequestContext) {
	entries, err := os.ReadDir(media.AudioDir())
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(consts.StatusOK, []AudioFile{})
			return
		}
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "read audio directory failed"})
		return
	}

	files := make([]AudioFile, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		if !isAllowedAudioExt(filepath.Ext(name)) {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		files = append(files, AudioFile{
			Name:     name,
			Path:     "/uploads/audio/" + name,
			Size:     info.Size(),
			Modified: info.ModTime().Format(time.RFC3339),
		})
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].Modified > files[j].Modified
	})

	c.JSON(consts.StatusOK, files)
}

func (h *Handler) RenameAudio(ctx context.Context, c *app.RequestContext) {
	var req renameAudioRequest
	if err := c.BindAndValidate(&req); err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	oldName, err := normalizeAudioFilename(req.OldName)
	if err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	newName, err := normalizeAudioFilename(req.NewName)
	if err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	if oldName == newName {
		path := "/uploads/audio/" + newName
		c.JSON(consts.StatusOK, map[string]string{
			"name": newName,
			"path": path,
			"url":  uploadOrigin(c) + path,
		})
		return
	}

	src := filepath.Join(media.AudioDir(), oldName)
	dst := filepath.Join(media.AudioDir(), newName)

	if _, err := os.Stat(src); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(consts.StatusNotFound, map[string]string{"error": "source audio not found"})
			return
		}
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "read source audio failed"})
		return
	}

	if _, err := os.Stat(dst); err == nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "target audio already exists"})
		return
	} else if !errors.Is(err, os.ErrNotExist) {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "check target audio failed"})
		return
	}

	if err := os.Rename(src, dst); err != nil {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "rename audio failed"})
		return
	}

	path := "/uploads/audio/" + newName
	c.JSON(consts.StatusOK, map[string]string{
		"name": newName,
		"path": path,
		"url":  uploadOrigin(c) + path,
	})
}

func (h *Handler) DeleteAudio(ctx context.Context, c *app.RequestContext) {
	rawFilename := c.Param("filename")
	filename, err := url.PathUnescape(rawFilename)
	if err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": "invalid audio filename"})
		return
	}

	filename, err = normalizeAudioFilename(filename)
	if err != nil {
		c.JSON(consts.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	path := filepath.Join(media.AudioDir(), filename)
	if _, err := os.Stat(path); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(consts.StatusNotFound, map[string]string{"error": "audio not found"})
			return
		}
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "read audio failed"})
		return
	}

	if err := os.Remove(path); err != nil {
		c.JSON(consts.StatusInternalServerError, map[string]string{"error": "delete audio failed"})
		return
	}

	c.JSON(consts.StatusOK, map[string]any{
		"success":  true,
		"filename": filename,
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

func normalizeAudioFilename(value string) (string, error) {
	name := strings.TrimSpace(value)
	if name == "" {
		return "", errors.New("audio filename is required")
	}
	if filepath.Base(name) != name || strings.Contains(name, "..") {
		return "", errors.New("invalid audio filename")
	}
	if !isAllowedAudioExt(filepath.Ext(name)) {
		return "", errors.New("unsupported audio type")
	}
	return name, nil
}

func isAllowedAudioExt(ext string) bool {
	switch strings.ToLower(ext) {
	case ".mp3", ".ogg", ".wav":
		return true
	default:
		return false
	}
}
