package service

type PostRequest struct {
	Title    string `json:"title"`
	Slug     string `json:"slug"`
	Category string `json:"category"`
	Color    string `json:"color"`
	Excerpt  string `json:"excerpt"`
	Content  string `json:"content"`
	ReadTime string `json:"readTime"`
	Image    string `json:"image"`
	Featured bool   `json:"featured"`
	Reverse  bool   `json:"reverse"`
	Status   string `json:"status"`
}

type StatusRequest struct {
	Status string `json:"status"`
}
