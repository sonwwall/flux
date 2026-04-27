package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) GetGitHubProfile(ctx context.Context, c *app.RequestContext) {
	snapshot, err := h.svc.GetGitHubSnapshot(ctx)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, snapshot)
}
