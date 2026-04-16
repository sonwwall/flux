package main

import (
	"log"

	"flux/backend/internal/config"
	"flux/backend/internal/router"
	"flux/backend/internal/store"
)

func main() {
	cfg := config.Load()

	db, err := store.Open(cfg.DSN)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}

	log.Printf("flux backend listening on %s", cfg.Addr)
	h := router.New(db, cfg.Addr)
	h.Spin()
}
