package service

type SiteInfo struct {
	Name        string `json:"name"`
	Theme       string `json:"theme"`
	Description string `json:"description"`
}

func (s *Service) SiteInfo() SiteInfo {
	return SiteInfo{
		Name:        "外城小站",
		Theme:       "flux",
		Description: "记录前端工程、个人项目、阅读笔记和日常观察的独立博客。",
	}
}
