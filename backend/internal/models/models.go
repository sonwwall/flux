package models

import "time"

type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"size:180;not null" json:"title"`
	Slug      string    `gorm:"size:180;uniqueIndex;not null" json:"slug"`
	Category  string    `gorm:"size:40;index;not null" json:"category"`
	Color     string    `gorm:"size:32;not null;default:primary" json:"color"`
	Excerpt   string    `gorm:"size:512;not null" json:"excerpt"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ReadTime  string    `gorm:"size:40;not null" json:"readTime"`
	Image     string    `gorm:"size:1024" json:"image"`
	Featured  bool      `gorm:"index" json:"featured"`
	Reverse   bool      `json:"reverse"`
	Status    string    `gorm:"size:24;index;not null;default:draft" json:"status"`
	Published time.Time `gorm:"index" json:"published"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Tag struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:60;uniqueIndex;not null" json:"name"`
	Description string    `gorm:"size:160;not null" json:"description"`
	Count       int       `gorm:"not null;default:0" json:"count"`
	Icon        string    `gorm:"size:60;not null" json:"icon"`
	Color       string    `gorm:"size:32;not null;default:primary" json:"color"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type TourConfig struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Badge       string    `gorm:"size:60;not null" json:"badge"`
	Title       string    `gorm:"size:160;not null" json:"title"`
	Description string    `gorm:"size:512;not null" json:"description"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type AuthorNote struct {
	Label string `json:"label"`
	Title string `json:"title"`
	Body  string `json:"body"`
}

type AuthorProfile struct {
	ID           uint         `gorm:"primaryKey" json:"id"`
	Name         string       `gorm:"size:80;not null" json:"name"`
	Handle       string       `gorm:"size:80;not null" json:"handle"`
	Role         string       `gorm:"size:80;not null" json:"role"`
	Bio          string       `gorm:"size:512;not null" json:"bio"`
	Avatar       string       `gorm:"size:1024" json:"avatar"`
	Github       string       `gorm:"size:160" json:"github"`
	Contact      string       `gorm:"size:160" json:"contact"`
	NoteSubtitle string       `gorm:"size:160" json:"noteSubtitle"`
	Notes        []AuthorNote `gorm:"serializer:json" json:"notes"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type AdminSummary struct {
	Posts      int64 `json:"posts"`
	Drafts     int64 `json:"drafts"`
	Tags       int64 `json:"tags"`
	MonthPosts int64 `json:"monthPosts"`
}

type SiteConfig struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	HeroTitle    string    `gorm:"size:200" json:"heroTitle"`
	HeroSubtitle string    `gorm:"size:200" json:"heroSubtitle"`
	HeroDesc     string    `gorm:"size:512" json:"heroDesc"`
	HeroImage    string    `gorm:"size:1024" json:"heroImage"`
	AdminSecret  string    `gorm:"size:128;not null;default:'flux-admin'" json:"-"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
