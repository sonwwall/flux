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

type AuthorProfile struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:80;not null" json:"name"`
	Handle    string    `gorm:"size:80;not null" json:"handle"`
	Role      string    `gorm:"size:80;not null" json:"role"`
	Bio       string    `gorm:"size:512;not null" json:"bio"`
	Avatar    string    `gorm:"size:1024" json:"avatar"`
	Github    string    `gorm:"size:160" json:"github"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type AdminSummary struct {
	Posts      int64 `json:"posts"`
	Drafts     int64 `json:"drafts"`
	Tags       int64 `json:"tags"`
	MonthPosts int64 `json:"monthPosts"`
}
