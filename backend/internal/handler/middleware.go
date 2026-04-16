package handler

import (
	"context"
	"strings"

	"flux/backend/internal/auth"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) JWTAuth() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		token := strings.TrimPrefix(string(c.GetHeader("Authorization")), "Bearer ")
		if err := auth.Verify(h.jwtSecret, token); err != nil {
			c.AbortWithStatusJSON(consts.StatusUnauthorized, utils.H{"error": "unauthorized"})
			return
		}
		c.Next(ctx)
	}
}
