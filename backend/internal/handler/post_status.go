package handler

import (
	"context"

	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) UpdatePostStatus(ctx context.Context, c *app.RequestContext) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	req, ok := bindJSON[service.StatusRequest](ctx, c)
	if !ok {
		return
	}
	post, err := h.svc.UpdatePostStatus(id, req.Status)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, post)
}
