# Flux 博客前端开发文档

## 技术栈

| 项目 | 版本 |
|------|------|
| 框架 | React 19 |
| 构建 | Vite 7 |
| 路由 | 基于 hash 的自定义路由（`useHashRoute`） |
| 样式 | 纯 CSS（暗色主题，CSS 变量 + BEM 命名） |
| 测试 | Jest + Testing Library |
| Markdown | marked + DOMPurify |
| 语言 | JavaScript (JSX) |
| 包管理 | npm |

---

## 目录结构（src/）

```
src/
├── app/
│   ├── App.jsx            # 应用壳层：状态管理、数据获取、路由分发
│   └── router.jsx         # 路由配置：页面组件映射 + props 注入
│
├── pages/                 # 页面级组件（每个路由对应一个）
│   ├── SplashPage/        # 炫酷加载页
│   ├── CardPage/          # 名片导览页（新首页）
│   ├── CardEditorPage/    # 导览页后台编辑器
│   ├── HomePage/          # 博客首页
│   ├── BlogPage/          # 博客文章列表
│   ├── ArticlePage/       # 文章详情页
│   ├── TagsPage/          # 标签云页
│   ├── AuthorPage/        # 作者介绍页
│   ├── AuthorEditorPage/  # 作者信息编辑
│   ├── AdminPage/         # 后台管理面板
│   ├── EditorPage/        # 文章编辑器
│   ├── SiteConfigEditorPage/  # 站点配置编辑
│   ├── TourEditorPage/    # 标签导览编辑（已弃用）
│   └── MissingPage/       # 404 页面
│
├── features/              # 业务功能模块
│   ├── auth/              # 登录鉴权（api, hooks, components）
│   ├── post/              # 文章相关（api, hooks, components）
│   └── navigation/        # 导航组件（TopNav, SideNav, Footer）
│
├── shared/                # 通用共享
│   ├── styles/styles.css  # 全局样式（暗色主题 CSS 变量 + 所有组件样式）
│   ├── ui/Icon.jsx        # Material Symbols 图标组件
│   ├── lib/format.js      # 工具函数（mediaURL, formatDate, estimateReadTime）
│   ├── lib/markdown.js    # Markdown 渲染（marked + DOMPurify）
│   ├── lib/request.js     # HTTP 请求封装
│   └── hooks/             # 通用 hooks
│
├── data/
│   └── fallback.js        # 回退数据（fallbackPosts, fallbackAuthor, fallbackSiteConfig 等）
│
├── hooks/                 # 应用级 hooks
│   ├── useAuth.js         # 登录状态管理
│   ├── usePosts.js        # 文章数据管理
│   └── useApiStatus.js    # API 连接状态
│
├── components/            # 通用组件
│   ├── Content.jsx        # Markdown 内容渲染
│   ├── Header.jsx         # 页面头部
│   ├── Sidebar.jsx        # 侧边栏
│   ├── LoginDialog.jsx    # 登录弹窗
│   ├── ErrorBoundary.jsx  # 错误边界
│   └── LoadingSpinner.jsx # 加载动画
│
├── utils/                 # 工具函数
│   ├── apiErrorHandler.js
│   └── errorHandler.js
│
└── main.jsx               # 应用入口
```

---

## 路由与页面

路由系统位于 `src/app/router.jsx`，使用 hash 路由，所有路由映射到 `src/pages/` 下的页面组件。

| 哈希路由 | 页面文件 | 功能说明 |
|---------|---------|---------|
| `#splash` | `SplashPage/index.jsx` | 炫酷加载页，点击进入导览页 |
| `#card` | `CardPage/index.jsx` | 名片导览页（新首页），展示个人信息、音乐播放、代码框、社交链接 |
| `#home` | `HomePage/index.jsx` | 博客首页，展示文章卡片列表 |
| `#blog` | `BlogPage/index.jsx` | 博客文章列表页，支持分类筛选和搜索 |
| `#tags` | `TagsPage/index.jsx` | 标签云页面 |
| `#article` | `ArticlePage/index.jsx` | 文章详情阅读页 |
| `#author` | `AuthorPage/index.jsx` | 作者信息展示页 |
| `#admin` | `AdminPage/index.jsx` | 后台管理面板入口 |
| `#editor` | `EditorPage/index.jsx` | 文章新建/编辑 |
| `#authorEditor` | `AuthorEditorPage/index.jsx` | 作者个人信息编辑 |
| `#cardEditor` | `CardEditorPage/index.jsx` | 导览页配置编辑 |
| `#siteConfigEditor` | `SiteConfigEditorPage/index.jsx` | 站点全局配置编辑 |
| `#missing` | `MissingPage/index.jsx` | 404 页面 |

### 默认路由

在 `src/shared/hooks/useHashRoute.js` 中配置。当前默认路由为 `#splash`（加载页），用户点击进入后跳转到 `#card`。

---

## 关键页面详解

### SplashPage（加载页）

- **位置**：`src/pages/SplashPage/index.jsx`
- **Props**：`setPage`, `siteConfig`
- **功能**：全屏炫酷过渡页面，点击/按 Enter 进入导览页
- **可编辑字段**（通过后台 → 编辑导览页 → 加载页设置）：
  - `splashTitle` — 标题文字（默认"外城小站"）
  - `splashSubtitle` — 副标题（默认"FLUX"）
  - `splashDesc` — 说明文字
  - `splashEnter` — 按钮文字（默认"点击进入 / Tap to enter"）
  - `splashEyebrow` — 装饰文字（默认"Flux Landing Sequence"）

### CardPage（名片导览页）

- **位置**：`src/pages/CardPage/index.jsx`
- **Props**：`author`, `siteConfig`, `adminSummary`, `posts`, `setPage`, `onSelectPost`
- **功能**：博客落地页，展示个人名片

**各区域说明：**

| 区域 | 描述 | 编辑位置 |
|------|------|---------|
| 名片正面 | 头像、名字、副标题、简介、标签 | 后台 → 编辑导览页 → 名片内容 |
| 名片背面 | 代码框（高亮 config 代码） | 后台 → 编辑导览页 → 代码框内容 |
| 社交链接 | GitHub、Twitter、Email 复制 | 后台 → 编辑导览页 → 社交链接 |
| Music Deck | 音乐播放器（进度条、音量、播放/暂停） | 后台 → 编辑导览页 → 音乐管理 |
| 展示卡片 × 3 | 最新文章（可点击）、站点统计、GitHub 信息 | 数据自动拉取，无需手动编辑 |
| 进入博客按钮 | 点击跳转到博客首页 | — |

### CardEditorPage（导览页编辑器）

- **位置**：`src/pages/CardEditorPage/index.jsx`
- **Props**：`siteConfig`, `author`, `onSave`, `setPage`
- **功能**：导览页全部可编辑内容的集中管理后台

**编辑区域：**

| 区域 | 包含字段 | 数据存储 |
|------|---------|---------|
| 视觉设置 | 起始色、结束色、发光色（颜色选择器） | siteConfig |
| 名片内容 | 名字、副标题、标签、标题文字、简介 | siteConfig + author |
| 代码框内容 | 完整代码（textarea） | siteConfig.codeBlockContent |
| 加载页设置 | 标题、副标题、说明文字、按钮文字、装饰文字 | siteConfig.splash* |
| 社交链接 | GitHub 链接、Twitter 链接、Email 地址 | author |
| 音乐管理 | 音乐文件列表、上传、重命名、删除、切换 | siteConfig.audioSrc |

---

## 数据流

### siteConfig（站点配置）

- **获取**：`GET /api/admin/site`
- **保存**：调用 `App.jsx` 中的 `handleSaveLandingConfig()` → `PUT /api/admin/site`
- **字段**：见 `src/data/fallback.js` 中的 `fallbackSiteConfig`
- **回退数据**：当 API 未返回时使用 `fallbackSiteConfig`

### author（作者数据）

- **获取**：`GET /api/author`
- **保存**：`PUT /api/author`
- **字段**：name, handle, bio, avatar, github, twitter, contact

### posts（文章数据）

- **获取**：`GET /api/posts`（公开列表），`GET /api/admin/posts`（后台完整列表）
- **创建**：`POST /api/admin/posts`
- **更新**：`PUT /api/admin/posts/:id`
- **删除**：`DELETE /api/admin/posts/:id`

### 文件上传

- **图片上传**：`POST /api/admin/uploads/images`（multipart/form-data）
- **音频上传**：`POST /api/admin/uploads/audio`（multipart/form-data）
- **音频列表**：`GET /api/admin/uploads/audio`
- **音频重命名**：`PUT /api/admin/uploads/audio`
- **音频删除**：`DELETE /api/admin/uploads/audio/:filename`
- **图片响应**：返回 `{ url, path, filename }`，前端通过 `mediaURL(path)` 转换为完整 URL

---

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（需后端也在运行）
npm run dev
# 默认监听 127.0.0.1:5173
# Vite 配置了 /api 和 /uploads 代理到 http://127.0.0.1:8080

# 构建生产版本
npm run build
# 产物输出到 dist/ 目录

# 预览构建产物
npm run preview

# 运行测试
npm test
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
```

### 开发环境要求

- Node.js >= 18
- 后端 Go 服务在 `http://127.0.0.1:8080` 运行
- Vite 代理配置在 `vite.config.js` 中

---

## 样式系统

### 暗色主题 CSS 变量

定义在 `src/shared/styles/styles.css` 的 `:root` 中：

```css
--surface: #0e0e0e;       /* 最底层背景 */
--surface-base: #1a1919;  /* 卡片/面板背景 */
--surface-high: #201f1f;  /* 悬浮态背景 */
--text: #f7f7f7;          /* 主要文字 */
--muted: #adaaaa;         /* 次要文字 */
--primary: #8cacff;       /* 主色调（蓝色） */
```

### BEM 命名规范

组件样式采用 BEM（Block Element Modifier）命名：

```
.card-page                  # Block
.card-page__mini-card       # Block__Element
.card-page__mini-card--clickable  # Block__Element--Modifier
.card-page__actions         # Block__Element
```

### 组件样式位置

所有样式集中在 `src/shared/styles/styles.css`（约 3600 行），没有 CSS Modules 或 CSS-in-JS。新增组件样式请追加到该文件的末尾。

---

## 样式系统中的关键组件类

| CSS 类 | 对应元素 |
|--------|---------|
| `.splash-page` | 加载页容器 |
| `.card-page` | 导览页容器 |
| `.card-page__mini-card` | 右侧展示卡片 |
| `.card-page__panel` | Music Deck 面板 |
| `.card-page__play-btn` | 圆形播放按钮 |
| `.card-page__enter` | 进入博客按钮 |
| `.card-page__code-block` | 代码框 |
| `.card-page__toast` | 复制成功气泡 |
| `.music-manager` | 后台音乐列表管理器 |
| `.editor-page` | 后台编辑器容器 |
| `.editor-layout` | 编辑器双栏布局 |

---

## 音乐播放器

- **前端**：`<audio>` 元素 + React state 控制播放/暂停/进度/音量
- **音频文件存储**：后端 `uploads/audio/` 目录
- **访问路径**：`/uploads/audio/filename.mp3`（通过 nginx 代理到后端）
- **文件命名**：上传时自动生成 timestamp 文件名，可在后台重命名

### MusicManager 组件

位于 `CardEditorPage/index.jsx` 内，功能：
- 列出所有已上传音频文件
- 点击 🎵 切换 设置当前播放文件
- 点击 ✏️ 重命名（inline 编辑，Enter 确认）
- 点击 🗑️ 删除（confirm 确认后删除，若为当前歌曲则清空 audioSrc）

---

## GitHub 信息卡片

- **位置**：CardPage 右侧第三张展示卡片
- **数据来源**：GitHub Public API（客户端 fetch，无需认证）
- **API 调用**：
  - `GET https://api.github.com/users/{username}` — 用户信息
  - `GET https://api.github.com/users/{username}/repos?sort=updated&per_page=4` — 最近仓库
- **用户名提取**：从 `author.github` URL 中解析
- **组件**：`GitHubInfoCard` 函数组件，在 `CardPage/index.jsx` 中定义

---

## 站点统计卡片

- **位置**：CardPage 右侧第二张展示卡片
- **数据来源**：`adminSummary` prop + 遍历 `posts` 数组
- **计算逻辑**：
  - 文章数：`adminSummary.posts - adminSummary.drafts`
  - 标签数：`adminSummary.tags`
  - 总阅读量：遍历 posts，提取每篇 `readTime` 的数字累加
  - 本月更新：`adminSummary.monthPosts`
- **组件**：`StationStatsCard` 函数组件，在 `CardPage/index.jsx` 中定义

---

## 后端配合

### Go 后端

- **位置**：`backend/` 目录
- **API 基础路径**：`/api/`
- **框架**：CloudWeGo Hertz
- **ORM**：GORM (MySQL)
- **数据库**：MySQL 8.4（Docker 容器运行）

### nginx 代理（生产环境）

配置在 `nginx.conf` 中：

```nginx
location /api/ {
    proxy_pass http://backend:8080/api/;
}
location /uploads/ {
    proxy_pass http://backend:8080/uploads/;
}
```

### 构建部署

```bash
# 构建前端和后端 Docker 镜像
docker compose build frontend backend

# 启动服务
docker compose up -d frontend backend
```

---

## 新增页面/功能开发流程

1. 在 `src/pages/` 下创建新页面组件
2. 在 `src/app/router.jsx` 中添加路由映射
3. 在 `src/app/App.jsx` 中传递所需 props
4. 如需新增后端 API，在 `backend/internal/handler/` 和 `backend/internal/router/router.go` 中添加
5. 前端 API 调用在 `src/features/post/api.js` 或对应模块中添加
6. `npm run build` 验证构建通过

---

## 文件说明（新增字段）

如需在后端 `SiteConfig` 模型新增字段：

1. `backend/internal/models/models.go` — 添加 GORM 字段
2. `backend/internal/handler/site_config.go` — 在 save/update 中处理新字段
3. `backend/internal/store/store.go` — 在默认值中初始化
4. `src/data/fallback.js` — 在 `fallbackSiteConfig` 中添加默认值
5. `src/pages/CardEditorPage/index.jsx` — 添加编辑 UI
6. GORM AutoMigrate 自动处理数据库列变更

---

*最后更新：2026-04-27*
