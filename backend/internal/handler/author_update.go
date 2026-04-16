package handler

import (
	"context"

	"flux/backend/internal/models"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) UpdateAuthor(ctx context.Context, c *app.RequestContext) {
	req, ok := bindJSON[models.AuthorProfile](ctx, c)
	if !ok {
		return
	}
	existing, err := h.svc.GetAuthor()
	if err != nil {
		writeError(c, err)
		return
	}
	existing.Name = req.Name
	existing.Handle = req.Handle
	existing.Role = req.Role
	existing.Bio = req.Bio
	existing.Avatar = req.Avatar
	existing.Github = req.Github
	existing.Contact = req.Contact
	existing.NoteSubtitle = req.NoteSubtitle
	existing.Notes = req.Notes
	if err := h.svc.UpdateAuthor(&existing); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(consts.StatusOK, existing)
}
