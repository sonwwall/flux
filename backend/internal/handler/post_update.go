package handler

import (
	"context"

	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) UpdatePost(ctx context.Context, c *app.RequestContext) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	req, ok := bindJSON[service.PostRequest](ctx, c)
	if !ok {
		return
	}
	post, err := h.svc.UpdatePost(id, req)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, post)
}
