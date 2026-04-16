package handler

import (
	"context"

	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) CreatePost(ctx context.Context, c *app.RequestContext) {
	req, ok := bindJSON[service.PostRequest](ctx, c)
	if !ok {
		return
	}
	post, err := h.svc.CreatePost(req)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusCreated, post)
}
