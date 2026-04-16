package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) Site(ctx context.Context, c *app.RequestContext) {
	c.JSON(consts.StatusOK, h.svc.SiteInfo())
}
