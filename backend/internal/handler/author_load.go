package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) GetAuthor(ctx context.Context, c *app.RequestContext) {
	author, err := h.svc.GetAuthor()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, author)
}
