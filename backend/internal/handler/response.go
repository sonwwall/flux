package handler

import (
	"context"
	"errors"
	"strconv"

	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"gorm.io/gorm"
)

func writeError(c *app.RequestContext, err error) {
	status := consts.StatusInternalServerError
	if errors.Is(err, gorm.ErrRecordNotFound) {
		status = consts.StatusNotFound
	} else {
		var validationErr service.ValidationError
		if errors.As(err, &validationErr) {
			status = consts.StatusBadRequest
		}
	}
	c.JSON(status, utils.H{"error": err.Error()})
}

func parseID(c *app.RequestContext) (uint, bool) {
	value, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || value == 0 {
		c.JSON(consts.StatusBadRequest, utils.H{"error": "invalid id"})
		return 0, false
	}
	return uint(value), true
}

func bindJSON[T any](ctx context.Context, c *app.RequestContext) (T, bool) {
	var req T
	if err := c.BindAndValidate(&req); err != nil {
		c.JSON(consts.StatusBadRequest, utils.H{"error": err.Error()})
		return req, false
	}
	return req, true
}
