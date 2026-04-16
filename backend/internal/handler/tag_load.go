package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) ListTags(ctx context.Context, c *app.RequestContext) {
	tags, err := h.svc.ListTags()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, tags)
}
