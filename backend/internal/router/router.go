package router

import (
	"context"
	"log"
	"time"

	"flux/backend/internal/config"
	"flux/backend/internal/dao"
	"flux/backend/internal/handler"
	"flux/backend/internal/media"
	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"gorm.io/gorm"
)

func New(db *gorm.DB, cfg config.Config) *server.Hertz {
	h := server.Default(
		server.WithHostPorts(cfg.Addr),
		server.WithMaxRequestBodySize(20<<20),
	)
	h.Use(corsAndLog())
	h.StaticFS("/uploads", &app.FS{
		Root:        media.UploadRoot(),
		PathRewrite: app.NewPathSlashesStripper(1),
	})

	hdl := handler.New(service.New(dao.New(db)), cfg.JWTSecret)
	api := h.Group("/api")

	api.GET("/health", hdl.Health)
	api.GET("/site", hdl.Site)
	api.GET("/posts", hdl.ListPosts)
	api.GET("/posts/:slug", hdl.GetPost)
	api.GET("/tags", hdl.ListTags)
	api.GET("/author", hdl.GetAuthor)
	api.GET("/admin/site", hdl.GetSiteConfig)

	api.POST("/auth/login", hdl.Login)

	authed := api.Group("", hdl.JWTAuth())
	authed.POST("/auth/change-secret", hdl.ChangeSecret)
	authed.PUT("/author", hdl.UpdateAuthor)
	authed.PUT("/admin/site", hdl.UpdateSiteConfig)
	authed.GET("/admin/summary", hdl.AdminSummary)
	authed.GET("/admin/posts", hdl.ListAdminPosts)
	authed.POST("/admin/posts", hdl.CreatePost)
	authed.PUT("/admin/posts/:id", hdl.UpdatePost)
	authed.PATCH("/admin/posts/:id/status", hdl.UpdatePostStatus)
	authed.DELETE("/admin/posts/:id", hdl.DeletePost)
	authed.POST("/admin/uploads/images", hdl.UploadImage)

	return h
}

func corsAndLog() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		start := time.Now()
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if string(c.Method()) == "OPTIONS" {
			c.AbortWithStatus(consts.StatusNoContent)
			return
		}
		c.Next(ctx)
		log.Printf("%s %s -> %d (%s)", c.Method(), c.Path(), c.Response.StatusCode(), time.Since(start))
	}
}
