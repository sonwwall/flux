package store

import (
	"time"

	"flux/backend/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func Open(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(&models.Post{}, &models.Tag{}, &models.TourConfig{}, &models.AuthorProfile{}, &models.SiteConfig{}); err != nil {
		return nil, err
	}
	if err := seed(db); err != nil {
		return nil, err
	}
	return db, nil
}

func seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.Post{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := db.Create(&seedPosts).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&models.Tag{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := db.Create(&seedTags).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&models.AuthorProfile{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := db.Create(&seedAuthor).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&models.TourConfig{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := db.Create(&seedTourConfig).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&models.SiteConfig{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := db.Create(&seedSiteConfig).Error; err != nil {
			return err
		}
	}
	return nil
}

var seedPosts = []models.Post{
	{
		Title:     "在城市边缘写代码：一个个人站点的长期主义",
		Slug:      "long-term-personal-blog",
		Category:  "随笔",
		Color:     "primary",
		Excerpt:   "关于为什么还要搭一个独立博客，以及如何让写作、项目和生活记录在同一个地方沉淀下来。",
		Content:   "个人博客的价值不在于流量，而在于给长期思考留下一个稳定的容器。外城小站会记录工程实践、阅读笔记、个人项目和日常观察。",
		ReadTime:  "6 分钟阅读",
		Image:     "https://lh3.googleusercontent.com/aida-public/AB6AXuDBQQkm_p8OCktAcCAVDuTRWFTJDVMSyU-cMOnS5E6FNYxsbeyVSG41HjgtFcbb1yYtKPhBdoFcQHCAcErDin7JJ2WahN70DdjHNhR7bf-PQQ--Gp2t9s_R0OCYFnFYcpWHMu2NzbdV82qb8dLuigBy-jSSuq_nm5N0EGR-oYlERrrnGafg9b0TZYW2qMDP6zNppT45uBW1oBkj2-qeBCHL6nrY8A-tS8XoDRY7XkJZzP2Hw2TgAAKk_tYgMo8Ib4HNjciI7mtEvjo",
		Featured:  true,
		Status:    "published",
		Published: time.Date(2026, 4, 12, 10, 0, 0, 0, time.Local),
	},
	{
		Title:     "React 小站的页面组织：从静态稿到可维护组件",
		Slug:      "react-blog-components",
		Category:  "前端",
		Color:     "secondary",
		Excerpt:   "一次把设计稿拆成导航、文章卡片、作者页与后台原型的实践笔记。",
		Content:   "页面拆分的核心是让导航、内容列表、文章详情、作者页和后台管理各自拥有清晰边界。",
		ReadTime:  "8 分钟阅读",
		Featured:  false,
		Status:    "published",
		Published: time.Date(2026, 4, 8, 10, 0, 0, 0, time.Local),
	},
	{
		Title:     "给标签云一点秩序：内容索引如何服务长期写作",
		Slug:      "tag-cloud-for-writing",
		Category:  "标签",
		Color:     "tertiary",
		Excerpt:   "标签不是装饰，而是帮助读者和作者重新发现旧文章的轻量信息架构。",
		Content:   "一个好的标签系统应该帮助内容被重新发现，而不是制造更多分类负担。",
		ReadTime:  "5 分钟阅读",
		Featured:  false,
		Status:    "published",
		Published: time.Date(2026, 4, 2, 10, 0, 0, 0, time.Local),
	},
	{
		Title:     "从开发机到部署：个人博客的最小发布链路",
		Slug:      "minimal-blog-release-flow",
		Category:  "工程",
		Color:     "primary-fixed",
		Excerpt:   "记录依赖安装、构建产物、忽略规则和部署前检查这些容易被忽略的基础细节。",
		Content:   "个人博客的发布链路不需要一开始就复杂，但必须清楚哪些文件应该进入仓库，哪些文件只属于本地环境。",
		ReadTime:  "10 分钟阅读",
		Image:     "https://lh3.googleusercontent.com/aida-public/AB6AXuDvvfFi2XuU7RlRFZroG13NaUDHeM2zukQoTxw--wwETaNR5ciU3vDzX8BDSwjK7awcdK2a6Z-rE-SFteIJrRtQieyDoy6aWX_BSm2c3ThE2Eadk09VGqHLCpf67q3TmXumzucvFoPN2hE5uMdVQKwzfFeLCYLNFn-0W6LGQxEnZgud0M_Wzy1EyS6qe9a2_NhdYU_SF2U_X1bsRWMFPbwIaBLZza9_oKRWNRV0p4UkxWrafRrtJS-OqmazpdYrALYyTx8DPL8JotU",
		Featured:  true,
		Reverse:   true,
		Status:    "published",
		Published: time.Date(2026, 3, 28, 10, 0, 0, 0, time.Local),
	},
	{
		Title:     "重构博客首页的信息层级",
		Slug:      "homepage-information-architecture",
		Category:  "前端",
		Color:     "secondary",
		Excerpt:   "草稿：如何让首页先说明站点身份，再承接文章与作者入口。",
		Content:   "草稿内容。",
		ReadTime:  "7 分钟阅读",
		Status:    "draft",
		Published: time.Date(2026, 4, 15, 10, 0, 0, 0, time.Local),
	},
}

var seedTags = []models.Tag{
	{Name: "前端", Description: "React / CSS / 交互", Count: 18, Icon: "code", Color: "primary"},
	{Name: "随笔", Description: "生活观察与长期记录", Count: 12, Icon: "edit_note", Color: "secondary"},
	{Name: "工程", Description: "构建、部署与工具链", Count: 15, Icon: "terminal", Color: "tertiary"},
	{Name: "阅读", Description: "书摘与知识卡片", Count: 9, Icon: "auto_stories", Color: "error"},
	{Name: "项目", Description: "个人作品与复盘", Count: 7, Icon: "deployed_code", Color: "primary-fixed"},
	{Name: "标签", Description: "内容组织方法", Count: 6, Icon: "sell", Color: "secondary"},
}

var seedAuthor = models.AuthorProfile{
	Name:    "外城",
	Handle:  "@outercity / 外城小站",
	Role:    "站长 / 作者",
	Bio:     "这里记录前端工程、个人项目、阅读笔记和一些日常观察。外城小站希望保持轻量、克制、长期可维护。",
	Avatar:  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzxZcXQXaWN5tJwrMXtGB6j8RFLmqgtaNw4yw0wyfozmefgRO-Bi-oPkAL2FXFxrVUI-luu_DBungj7wbwU8BuUwcHXm2vMMSVyVqMI0dS5JMwtTymzSOIbAwNGuSrWBSRJfRsndDQAyWiLQke8hesyKwkb1WJPIfG3eKdAQMhT3eZGvBhWnsG-7cTBNj169H0kVyg6v1qXccqLsh7qcn8Re67IIz9IvQSZGurfA5JphMLw5C6CSL3sgVSsehfLgIOdJT7z70-Zds",
	Github:  "https://github.com",
	Twitter: "https://x.com",
	Contact: "hello@outercity.dev",
}

var seedTourConfig = models.TourConfig{
	Badge:       "标签云",
	Title:       "内容索引",
	Description: "通过标签快速进入不同主题。标签大小和文章数会随着后续内容增加继续扩展。",
}

var seedSiteConfig = models.SiteConfig{
	HeroTitle:            "在外城边缘，记录技术、阅读与日常。",
	HeroSubtitle:         "外城小站 / 个人博客 / flux 主题",
	HeroDesc:             "这里是外城小站，一个用来沉淀工程实践、个人项目、阅读笔记和生活观察的独立博客。",
	HeroImage:            "",
	LandingGradientStart: "#193554",
	LandingGradientEnd:   "#1d1646",
	LandingGlow:          "rgba(122, 163, 255, 0.24)",
	MusicPlaceholder:     "音乐播放器区域先保留 UI，可在后端接入歌单或外链播放器。",
	AudioSrc:             "",
	CodeBlockContent:     "route: \"#home\",\nfocus: [\"前端\", \"长期写作\", \"设计系统\"],\npublished: 36,\ntags: 18,\ncontact: \"hello@outercity.dev\",\nstack: [\"React\", \"Vite\", \"Go\"]",
	AdminSecret:          "123456",
}
