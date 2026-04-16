package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) DeletePost(ctx context.Context, c *app.RequestContext) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	if err := h.svc.DeletePost(id); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, utils.H{"deleted": id})
}
