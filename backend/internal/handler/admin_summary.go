package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) AdminSummary(ctx context.Context, c *app.RequestContext) {
	summary, err := h.svc.AdminSummary()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, summary)
}
