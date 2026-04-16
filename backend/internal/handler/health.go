package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) Health(ctx context.Context, c *app.RequestContext) {
	c.JSON(consts.StatusOK, utils.H{"status": "ok"})
}
