package router

import (
	"context"
	"log"
	"time"

	"flux/backend/internal/dao"
	"flux/backend/internal/handler"
	"flux/backend/internal/media"
	"flux/backend/internal/service"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"gorm.io/gorm"
)

func New(db *gorm.DB, addr string) *server.Hertz {
	h := server.Default(
		server.WithHostPorts(addr),
		server.WithMaxRequestBodySize(20<<20),
	)
	h.Use(corsAndLog())
	h.StaticFS("/uploads", &app.FS{
		Root:        media.UploadRoot(),
		PathRewrite: app.NewPathSlashesStripper(1),
	})

	hdl := handler.New(service.New(dao.New(db)))
	api := h.Group("/api")

	api.GET("/health", hdl.Health)
	api.GET("/site", hdl.Site)

	api.GET("/posts", hdl.ListPosts)
	api.GET("/posts/:slug", hdl.GetPost)
	api.GET("/tags", hdl.ListTags)
	api.GET("/author", hdl.GetAuthor)

	api.GET("/admin/summary", hdl.AdminSummary)
	api.GET("/admin/posts", hdl.ListAdminPosts)
	api.POST("/admin/posts", hdl.CreatePost)
	api.PUT("/admin/posts/:id", hdl.UpdatePost)
	api.PATCH("/admin/posts/:id/status", hdl.UpdatePostStatus)
	api.DELETE("/admin/posts/:id", hdl.DeletePost)
	api.POST("/admin/uploads/images", hdl.UploadImage)

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
