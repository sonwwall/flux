package handler

import (
	"context"
	"strings"

	"flux/backend/internal/auth"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) Login(ctx context.Context, c *app.RequestContext) {
	var req struct {
		Secret string `json:"secret"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(consts.StatusBadRequest, utils.H{"error": "invalid request"})
		return
	}
	cfg, err := h.svc.GetSiteConfig()
	if err != nil || req.Secret != cfg.AdminSecret {
		c.JSON(consts.StatusUnauthorized, utils.H{"error": "invalid secret"})
		return
	}
	token, err := auth.Issue(h.jwtSecret)
	if err != nil {
		c.JSON(consts.StatusInternalServerError, utils.H{"error": "token error"})
		return
	}
	c.JSON(consts.StatusOK, utils.H{"token": token})
}

func (h *Handler) ChangeSecret(ctx context.Context, c *app.RequestContext) {
	var req struct {
		Secret string `json:"secret"`
	}
	if err := c.BindJSON(&req); err != nil || strings.TrimSpace(req.Secret) == "" {
		c.JSON(consts.StatusBadRequest, utils.H{"error": "secret required"})
		return
	}
	cfg, err := h.svc.GetSiteConfig()
	if err != nil {
		c.JSON(consts.StatusInternalServerError, utils.H{"error": err.Error()})
		return
	}
	cfg.AdminSecret = req.Secret
	if err := h.svc.UpdateSiteConfig(&cfg); err != nil {
		c.JSON(consts.StatusInternalServerError, utils.H{"error": err.Error()})
		return
	}
	c.JSON(consts.StatusOK, utils.H{"ok": true})
}
