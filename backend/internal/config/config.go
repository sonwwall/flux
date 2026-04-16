package config

import "os"

type Config struct {
	Addr string
	DSN  string
}

func Load() Config {
	return Config{
		Addr: env("APP_ADDR", "127.0.0.1:8080"),
		DSN:  env("DB_DSN", "flux:flux_pass@tcp(127.0.0.1:3306)/flux_blog?charset=utf8mb4&parseTime=True&loc=Local"),
	}
}

func env(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
