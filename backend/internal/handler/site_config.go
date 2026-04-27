package handler

import (
	"context"

	"flux/backend/internal/models"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) GetSiteConfig(ctx context.Context, c *app.RequestContext) {
	cfg, err := h.svc.GetSiteConfig()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, cfg)
}

func (h *Handler) UpdateSiteConfig(ctx context.Context, c *app.RequestContext) {
	req, ok := bindJSON[models.SiteConfig](ctx, c)
	if !ok {
		return
	}
	existing, err := h.svc.GetSiteConfig()
	if err != nil {
		writeError(c, err)
		return
	}
	existing.HeroTitle = req.HeroTitle
	existing.HeroSubtitle = req.HeroSubtitle
	existing.HeroDesc = req.HeroDesc
	existing.HeroImage = req.HeroImage
	existing.LandingGradientStart = req.LandingGradientStart
	existing.LandingGradientEnd = req.LandingGradientEnd
	existing.LandingGlow = req.LandingGlow
	existing.MusicPlaceholder = req.MusicPlaceholder
	if err := h.svc.UpdateSiteConfig(&existing); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, existing)
}
