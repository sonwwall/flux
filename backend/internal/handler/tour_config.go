package handler

import (
	"context"

	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) GetTourConfig(ctx context.Context, c *app.RequestContext) {
	cfg, err := h.svc.GetTourConfig()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, cfg)
}

func (h *Handler) UpdateTourPage(ctx context.Context, c *app.RequestContext) {
	req, ok := bindJSON[service.TourPageRequest](ctx, c)
	if !ok {
		return
	}
	result, err := h.svc.UpdateTourPage(req)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, result)
}
