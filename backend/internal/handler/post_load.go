package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) ListPosts(ctx context.Context, c *app.RequestContext) {
	posts, err := h.svc.ListPosts(c.Query("q"), c.Query("includeDrafts") == "true")
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, posts)
}

func (h *Handler) GetPost(ctx context.Context, c *app.RequestContext) {
	post, err := h.svc.GetPostBySlug(c.Param("slug"))
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, post)
}

func (h *Handler) ListAdminPosts(ctx context.Context, c *app.RequestContext) {
	posts, err := h.svc.ListAdminPosts()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, posts)
}
