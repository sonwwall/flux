package handler

import "flux/backend/internal/service"

type Handler struct {
	svc       *service.Service
	jwtSecret string
}

func New(svc *service.Service, jwtSecret string) *Handler {
	return &Handler{svc: svc, jwtSecret: jwtSecret}
}
