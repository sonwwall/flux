export const fallbackImages = {
  hero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuByKP9le0Lkt5pcL-Aw3-Lcxc4LPwqKo3H0WISzVDyAV8mZ-WkolOk3WoESFkiu6bOQItaZsqlrwohD95XU0-JnsXjWv3szXVEWMc7sMLEN06OZ7Y7I7l0eDDaSOBDVijxtWfI_OttWxSRDx-uS29peA_XLwHM0C_cBT09OTybTfxpu_m_VKvgBNOnk1-4coIPMoz_ru2-dY42AVp8gnSHp3fbpUZVXCy_nDEWk9eZS7qXNYtjX8eyOGWMuyCw1lYID6Ker1h2-qzw",
  circuit:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDBQQkm_p8OCktAcCAVDuTRWFTJDVMSyU-cMOnS5E6FNYxsbeyVSG41HjgtFcbb1yYtKPhBdoFcQHCAcErDin7JJ2WahN70DdjHNhR7bf-PQQ--Gp2t9s_R0OCYFnFYcpWHMu2NzbdV82qb8dLuigBy-jSSuq_nm5N0EGR-oYlERrrnGafg9b0TZYW2qMDP6zNppT45uBW1oBkj2-qeBCHL6nrY8A-tS8XoDRY7XkJZzP2Hw2TgAAKk_tYgMo8Ib4HNjciI7mtEvjo",
  planet:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDvvfFi2XuU7RlRFZroG13NaUDHeM2zukQoTxw--wwETaNR5ciU3vDzX8BDSwjK7awcdK2a6Z-rE-SFteIJrRtQieyDoy6aWX_BSm2c3ThE2Eadk09VGqHLCpf67q3TmXumzucvFoPN2hE5uMdVQKwzfFeLCYLNFn-0W6LGQxEnZgud0M_Wzy1EyS6qe9a2_NhdYU_SF2U_X1bsRWMFPbwIaBLZza9_oKRWNRV0p4UkxWrafRrtJS-OqmazpdYrALYyTx8DPL8JotU",
  article:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCeiPXZ-OXJVqMxWk3jP-lDydLGTlinjXCFYM6pE5CRUcjmcNa3rOcpaIwmneTIyyqlPuBJrUc6VCe8gI1M7MeTQcjIoCrICZU7KVdl4i1RNbddJ8V1hUE36ktWGx0vKBVBZRvb72iIwGLu0vdk8ubOVdEhZmorbSYKW5QEEnJ6RF23fYbfHHJVwMtvLVM2iZMNktalBl-4Ykuq7dgEtweJFZ--2GrxvDWVb9uBjyGv0JE4d9CE7erGSg90tQr3GKIj1wPGwx8oXaw",
  author:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCzxZcXQXaWN5tJwrMXtGB6j8RFLmqgtaNw4yw0wyfozmefgRO-Bi-oPkAL2FXFxrVUI-luu_DBungj7wbwU8BuUwcHXm2vMMSVyVqMI0dS5JMwtTymzSOIbAwNGuSrWBSRJfRsndDQAyWiLQke8hesyKwkb1WJPIfG3eKdAQMhT3eZGvBhWnsG-7cTBNj169H0kVyg6v1qXccqLsh7qcn8Re67IIz9IvQSZGurfA5JphMLw5C6CSL3sgVSsehfLgIOdJT7z70-Zds",
};

export const fallbackPosts = [
  {
    title: "在城市边缘写代码：一个个人站点的长期主义",
    category: "随笔",
    color: "primary",
    date: "2026 年 4 月 12 日",
    read: "6 分钟阅读",
    image: fallbackImages.circuit,
    featured: true,
    excerpt:
      "关于为什么还要搭一个独立博客，以及如何让写作、项目和生活记录在同一个地方沉淀下来。",
  },
  {
    title: "React 小站的页面组织：从静态稿到可维护组件",
    category: "前端",
    color: "secondary",
    date: "2026 年 4 月 8 日",
    read: "8 分钟阅读",
    excerpt:
      "一次把设计稿拆成导航、文章卡片、作者页与后台原型的实践笔记。",
  },
  {
    title: "给标签云一点秩序：内容索引如何服务长期写作",
    category: "标签",
    color: "tertiary",
    date: "2026 年 4 月 2 日",
    read: "5 分钟阅读",
    excerpt:
      "标签不是装饰，而是帮助读者和作者重新发现旧文章的轻量信息架构。",
  },
  {
    title: "从开发机到部署：个人博客的最小发布链路",
    category: "工程",
    color: "primary-fixed",
    date: "2026 年 3 月 28 日",
    read: "10 分钟阅读",
    image: fallbackImages.planet,
    featured: true,
    reverse: true,
    excerpt:
      "记录依赖安装、构建产物、忽略规则和部署前检查这些容易被忽略的基础细节。",
  },
];

export const fallbackTags = [
  ["前端", "React / CSS / 交互", "18", "code", "primary"],
  ["随笔", "生活观察与长期记录", "12", "edit_note", "secondary"],
  ["工程", "构建、部署与工具链", "15", "terminal", "tertiary"],
  ["阅读", "书摘与知识卡片", "9", "auto_stories", "error"],
  ["项目", "个人作品与复盘", "7", "deployed_code", "primary-fixed"],
  ["标签", "内容组织方法", "6", "sell", "secondary"],
];

export const fallbackTourConfig = {
  badge: "标签云",
  title: "内容索引",
  description: "通过标签快速进入不同主题。标签大小和文章数会随着后续内容增加继续扩展。",
};

export const fallbackAuthor = {
  name: "外城",
  handle: "@outercity / 外城小站",
  role: "站长 / 作者",
  bio: "这里记录前端工程、个人项目、阅读笔记和一些日常观察。外城小站希望保持轻量、克制、长期可维护。",
  avatar: fallbackImages.author,
  github: "https://github.com",
  twitter: "https://x.com",
  contact: "",
  noteSubtitle: "当前阶段普通用户不开放登录",
  notes: [
    { label: "原则", title: "先写作，再扩展功能", body: "普通访客可以阅读博客、浏览作者信息和标签云。登录、评论、订阅管理等功能暂不对普通用户开放。" },
    { label: "后台", title: "作者后台仅作为管理入口", body: "后台用于文章、标签和草稿管理。当前是前端原型，后续可接入真实鉴权和内容接口。" },
  ],
};

export const fallbackSiteConfig = {
  heroTitle: "在外城边缘，记录技术、阅读与日常。",
  heroSubtitle: "外城小站 / 个人博客 / flux 主题",
  heroDesc: "这里是外城小站，一个用来沉淀工程实践、个人项目、阅读笔记和生活观察的独立博客。",
  heroImage: "",
  landingGradientStart: "#193554",
  landingGradientEnd: "#1d1646",
  landingGlow: "rgba(122, 163, 255, 0.24)",
  musicPlaceholder: "音乐播放器区域先保留 UI，可在后端接入歌单或外链播放器。",
  audioSrc: "",
  cardTags: "前端,写作,独立博客",
  codeBlockContent:
    'const outerCity = {\n  route: "#home",\n  focus: ["前端", "长期写作", "设计系统"],\n  published: 36,\n  tags: 18,\n  contact: "hello@outercity.dev",\n  stack: ["React", "Vite", "Go"],\n};',
  splashEyebrow: "Flux Landing Sequence",
  splashTitle: "外城小站",
  splashSubtitle: "FLUX",
  splashDesc: "在城市边缘启动一座长期写作与工程沉淀的小站。",
  splashEnter: "点击进入 / Tap to enter",
};

export const fallbackAdminSummary = {
  posts: 42,
  drafts: 6,
  tags: 18,
  monthPosts: 4,
};

export const emptyEditorPost = {
  title: "",
  slug: "",
  category: "随笔",
  color: "primary",
  excerpt: "",
  content: "",
  image: "",
  status: "draft",
};
