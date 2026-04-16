import React, { useEffect, useMemo, useState } from "react";
import { marked } from "marked";

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

const apiOrigin = import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8080";

const mediaURL = (value = "") => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  if (value.startsWith("/uploads/")) {
    return `${apiOrigin}${value}`;
  }
  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      if (url.pathname.startsWith("/uploads/") && ["127.0.0.1", "localhost"].includes(url.hostname)) {
        return `${apiOrigin}${url.pathname}`;
      }
    } catch {
      return value;
    }
    return value;
  }
  if (value.startsWith("//")) {
    return value;
  }
  return value;
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

const renderMarkdown = (markdown) => {
  resetHeadingSlugCounts();
  return marked.parse(markdown || "");
};

const extractToc = (markdown) => {
  resetHeadingSlugCounts();
  return marked
    .lexer(markdown || "")
    .filter((token) => token.type === "heading" && token.depth >= 1 && token.depth <= 3)
    .map((token) => {
      const text = plainTextFromTokens(token.tokens) || token.text;
      return {
        id: nextHeadingId(text),
        title: text,
        depth: token.depth,
      };
    });
};

const img = {
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

const fallbackPosts = [
  {
    title: "在城市边缘写代码：一个个人站点的长期主义",
    category: "随笔",
    color: "primary",
    date: "2026 年 4 月 12 日",
    read: "6 分钟阅读",
    image: img.circuit,
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
    image: img.planet,
    featured: true,
    reverse: true,
    excerpt:
      "记录依赖安装、构建产物、忽略规则和部署前检查这些容易被忽略的基础细节。",
  },
];

const fallbackTags = [
  ["前端", "React / CSS / 交互", "18", "code", "primary"],
  ["随笔", "生活观察与长期记录", "12", "edit_note", "secondary"],
  ["工程", "构建、部署与工具链", "15", "terminal", "tertiary"],
  ["阅读", "书摘与知识卡片", "9", "auto_stories", "error"],
  ["项目", "个人作品与复盘", "7", "deployed_code", "primary-fixed"],
  ["标签", "内容组织方法", "6", "sell", "secondary"],
];

const navItems = [
  ["home", "首页", "home"],
  ["blog", "博客", "article"],
  ["tags", "标签云", "sell"],
  ["author", "作者", "person"],
];

const fallbackAuthor = {
  name: "外城",
  handle: "@outercity / 外城小站",
  role: "站长 / 作者",
  bio: "这里记录前端工程、个人项目、阅读笔记和一些日常观察。外城小站希望保持轻量、克制、长期可维护。",
  avatar: img.author,
  github: "https://github.com",
};

const fallbackAdminSummary = {
  posts: 42,
  drafts: 6,
  tags: 18,
  monthPosts: 4,
};

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function App() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState(fallbackPosts);
  const [adminPosts, setAdminPosts] = useState(fallbackPosts);
  const [tags, setTags] = useState(fallbackTags);
  const [author, setAuthor] = useState(fallbackAuthor);
  const [adminSummary, setAdminSummary] = useState(fallbackAdminSummary);
  const [apiStatus, setApiStatus] = useState("checking");
  const [editorDraft, setEditorDraft] = useState(emptyEditorPost);
  const [selectedPost, setSelectedPost] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const [postData, adminPostData, tagData, authorData, summaryData] = await Promise.all([
      loadJSON("/api/posts"),
      loadJSON("/api/admin/posts"),
      loadJSON("/api/tags"),
      loadJSON("/api/author"),
      loadJSON("/api/admin/summary"),
    ]);

    if (postData) setPosts(postData.map(normalizePost));
    if (adminPostData) setAdminPosts(adminPostData.map(normalizePost));
    if (tagData) setTags(tagData.map(normalizeTag));
    if (authorData) setAuthor(authorData);
    if (summaryData) setAdminSummary(summaryData);

    setApiStatus([postData, adminPostData, tagData, authorData, summaryData].some(Boolean) ? "online" : "offline");
  }

  async function savePost(draft) {
    const path = draft.id ? `/api/admin/posts/${draft.id}` : "/api/admin/posts";
    const saved = await apiJSON(path, {
      method: draft.id ? "PUT" : "POST",
      body: draft,
    });
    if (saved && !saved.error) await refreshData();
    return saved;
  }

  async function saveEditorPost(draft, status) {
    const saved = await savePost({ ...draft, status });
    if (saved && !saved.error) {
      setEditorDraft(toEditorDraft(normalizePost(saved)));
    }
    return saved;
  }

  async function updatePostStatus(post, status) {
    if (!post.id) return { error: "文章缺少 ID，无法操作" };
    const updated = await apiJSON(`/api/admin/posts/${post.id}/status`, {
      method: "PATCH",
      body: { status },
    });
    if (updated && !updated.error) {
      await refreshData();
    }
    return updated;
  }

  async function deletePost(post) {
    if (!post.id) return { error: "文章缺少 ID，无法删除" };
    const deleted = await apiJSON(`/api/admin/posts/${post.id}`, {
      method: "DELETE",
    });
    if (deleted && !deleted.error) {
      await refreshData();
    }
    return deleted;
  }

  const content = {
    home: <HomePage posts={posts} setPage={setPage} onSelectPost={setSelectedPost} />,
    blog: (
      <BlogPage
        posts={posts}
        query={query}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        setPage={setPage}
        onSelectPost={setSelectedPost}
      />
    ),
    tags: <TagsPage tags={tags} posts={posts} setPage={setPage} setCategoryFilter={setCategoryFilter} />,
    article: <ArticlePage post={selectedPost || posts[0]} author={author} setPage={setPage} setCategoryFilter={setCategoryFilter} />,
    author: <AuthorPage author={author} adminSummary={adminSummary} setPage={setPage} />,
    admin: (
      <AdminPage
        posts={adminPosts}
        adminSummary={adminSummary}
        onNewPost={() => {
          setEditorDraft(newEditorDraft());
          setPage("editor");
        }}
        onEditPost={(post) => {
          setEditorDraft(toEditorDraft(post));
          setPage("editor");
        }}
        onUpdatePostStatus={updatePostStatus}
        onDeletePost={deletePost}
      />
    ),
    editor: <EditorPage draft={editorDraft} setDraft={setEditorDraft} onSavePost={saveEditorPost} setPage={setPage} />,
    missing: <MissingPage setPage={setPage} />,
  }[page] ?? <MissingPage setPage={setPage} />;

  return (
    <>
      <TopNav page={page} setPage={setPage} query={query} setQuery={setQuery} apiStatus={apiStatus} setCategoryFilter={setCategoryFilter} />
      <SideNav page={page} setPage={setPage} setCategoryFilter={setCategoryFilter} />
      <main className={`app-shell ${page === "article" ? "article-shell" : ""}`}>{content}</main>
    </>
  );
}

async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function apiJSON(path, options = {}) {
  try {
    const response = await fetch(path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
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

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/admin/uploads/images", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 413) {
        return { error: "图片太大，请上传 20MB 以内的图片" };
      }
      return { error: data?.error || `upload failed: ${response.status}` };
    }
    return data;
  } catch {
    return { error: "network error" };
  }
}

function normalizePost(post) {
  return {
    ...post,
    date: formatDate(post.published) || post.date || "",
    read: post.readTime || post.read || "5 分钟阅读",
    image: post.image || "",
  };
}

function normalizeTag(tag) {
  return [tag.name, tag.description, String(tag.count), tag.icon, tag.color];
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function TopNav({ page, setPage, query, setQuery, apiStatus, setCategoryFilter }) {
  const navigate = (id) => {
    if (id === "blog") setCategoryFilter("");
    setPage(id);
  };

  return (
    <header className="top-nav">
      <button className="brand" onClick={() => navigate("home")} aria-label="flux 首页">
        <span>flux</span>
        <strong>外城小站</strong>
      </button>
      <nav className="top-links" aria-label="主导航">
        {[
          ["blog", "博客"],
          ["tags", "标签云"],
          ["author", "作者"],
        ].map(([id, label]) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <label className="search-field">
          <Icon>search</Icon>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              setCategoryFilter("");
              setPage("blog");
            }}
            placeholder="搜索文章..."
          />
        </label>
        <span className={`api-status ${apiStatus}`}>
          {apiStatus === "online" ? "API 已连接" : apiStatus === "offline" ? "API 未连接" : "API 检测中"}
        </span>
      </div>
    </header>
  );
}

function SideNav({ page, setPage, setCategoryFilter }) {
  const navigate = (id) => {
    if (id === "blog") setCategoryFilter("");
    setPage(id);
  };

  return (
    <aside className="side-nav">
      <div className="side-kicker">
        <strong>导航</strong>
        <span>技术索引</span>
      </div>
      <nav aria-label="技术索引">
        {navItems.map(([id, label, icon], index) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
            <i className={`dot dot-${index}`} />
            <Icon>{icon}</Icon>
            {label}
          </button>
        ))}
      </nav>
      <div className="side-footer">
        <button onClick={() => setPage("admin")}>
          <Icon>admin_panel_settings</Icon>
          作者后台
        </button>
        <button onClick={() => setPage("missing")}>
          <Icon>history</Icon>
          归档
        </button>
      </div>
    </aside>
  );
}

function HomePage({ posts, setPage, onSelectPost }) {
  const heroPost = posts.find((post) => post.image) || posts[0];
  const heroImage = mediaURL(heroPost?.image) || img.hero;

  return (
    <div className="content-wrap">
      <section className="hero">
        <img src={heroImage} alt="外城小站首页标题图" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <div className="meta-row">
            <span className="pill gradient">外城小站</span>
            <span>个人博客 / flux 主题</span>
          </div>
          <h1>在外城边缘，记录技术、阅读与日常。</h1>
          <p>
            这里是外城小站，一个用来沉淀工程实践、个人项目、阅读笔记和生活观察的独立博客。
          </p>
          <button className="primary-button" onClick={() => setPage("blog")}>
            进入博客 <Icon>arrow_forward</Icon>
          </button>
        </div>
      </section>

      <SectionHeader
        title="最新文章"
        eyebrow="外城记录 / 最近更新"
        actions={["全部文章", "按时间"]}
      />

      <section className="post-grid">
        {posts.map((post, i) => {
          const navigate = () => { onSelectPost(post); setPage("article"); };
          if (post.featured) return <WidePostCard key={post.title} post={post} onClick={navigate} />;
          const layouts = [
            { imagePos: "top", size: "large" },
            { imagePos: "top", size: "normal" },
            { imagePos: "top", size: "normal" },
            { imagePos: "left", size: "wide" },
            { imagePos: "none", size: "normal" },
            { imagePos: "none", size: "normal" },
          ];
          const { imagePos, size } = layouts[i % layouts.length];
          return <PostCard key={post.title} post={post} imagePos={post.image ? imagePos : "none"} size={size} onClick={navigate} />;
        })}
      </section>

      <section className="newsletter">
        <div>
          <h2>每周信号</h2>
          <p>
            订阅外城小站的更新摘要，偶尔收到新文章、项目进展和一些值得保存的链接。
          </p>
        </div>
        <form>
          <input placeholder="terminal@flux.dev" type="email" />
          <button className="primary-button" type="button">
            立即订阅
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function SectionHeader({ title, eyebrow, actions = [] }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        <p>{eyebrow}</p>
      </div>
      {actions.length > 0 && (
        <div className="section-actions">
          {actions.map((action) => (
            <button key={action}>{action}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function WidePostCard({ post, onClick }) {
  return (
    <article className={`post-card wide ${post.reverse ? "reverse" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="post-media">
        <img src={mediaURL(post.image)} alt="" />
      </div>
      <div className="post-body">
        <CategoryLabel post={post} />
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <CardMeta post={post} />
      </div>
    </article>
  );
}

function PostCard({ post, imagePos = "top", size = "normal", onClick }) {
  const image = mediaURL(post.image);
  const hasImage = !!image;
  const showImage = hasImage && imagePos !== "none";
  const isHorizontal = imagePos === "left" || imagePos === "right";
  return (
    <article className={`post-card compact img-${imagePos} size-${size} ${isHorizontal ? "horizontal" : ""}`} onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined }}>
      {showImage && (
        <div className="post-media compact-media">
          <img src={image} alt="" />
        </div>
      )}
      <div className="post-card-body">
        <div>
          <CategoryLabel post={post} />
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
        <CardMeta post={post} />
      </div>
    </article>
  );
}

function CategoryLabel({ post }) {
  return (
    <div className="category-label">
      <i className={post.color} />
      <span className={post.color}>{post.category}</span>
    </div>
  );
}

function CardMeta({ post }) {
  return (
    <div className="card-meta">
      <span>{post.read}</span>
      <span>{post.date}</span>
    </div>
  );
}

function BlogPage({ posts, query, categoryFilter, setCategoryFilter, setPage, onSelectPost }) {
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = !categoryFilter || post.category === categoryFilter;
      const matchesQuery = !term || `${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, categoryFilter]);

  return (
    <div className="content-wrap page-pad">
      <header className="page-hero">
        <div className="signal">
          <i />
          <span>博客</span>
        </div>
        <h1>{categoryFilter ? `${categoryFilter}文章` : "文章归档"}</h1>
        <p>
          {categoryFilter
            ? `当前展示“${categoryFilter}”分类下的文章。你可以继续搜索标题、摘要或切换回全部文章。`
            : "按发布时间浏览外城小站的全部文章。当前阶段先提供阅读和检索，评论与普通用户登录暂不开放。"}
        </p>
        {categoryFilter && (
          <button className="filter-clear" type="button" onClick={() => setCategoryFilter("")}>
            <Icon>close</Icon>
            查看全部文章
          </button>
        )}
      </header>
      <section className="result-list blog-list">
        {results.length ? results.map((post) => (
          <article key={post.title} onClick={() => { onSelectPost(post); setPage("article"); }}>
            {post.image && (
              <div className="blog-card-image">
                <img src={mediaURL(post.image)} alt="" />
              </div>
            )}
            <CategoryLabel post={post} />
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <CardMeta post={post} />
          </article>
        )) : (
          <article className="empty-result">
            <Icon>search_off</Icon>
            <h3>没有找到文章</h3>
            <p>当前分类或搜索条件下没有文章。可以清除筛选后再看全部内容。</p>
          </article>
        )}
      </section>
    </div>
  );
}

function TagsPage({ tags, posts, setPage, setCategoryFilter }) {
  const categoryCounts = useMemo(
    () =>
      posts.reduce((counts, post) => {
        const category = post.category || "未分类";
        return {
          ...counts,
          [category]: (counts[category] || 0) + 1,
        };
      }, {}),
    [posts],
  );

  const openCategory = (name) => {
    setCategoryFilter(name);
    setPage("blog");
  };

  return (
    <div className="content-wrap page-pad">
      <header className="page-hero">
        <div className="signal">
          <i />
          <span>标签云</span>
        </div>
        <h1>内容索引</h1>
        <p>通过标签快速进入不同主题。标签大小和文章数会随着后续内容增加继续扩展。</p>
      </header>
      <section className="category-grid">
        {tags.map(([name, subtitle, , icon, color]) => (
          <button className="category-card" key={name} type="button" onClick={() => openCategory(name)}>
            <Icon className="ghost-icon">{icon}</Icon>
            <i className={`glow ${color}`} />
            <h3>{name}</h3>
            <p>{subtitle}</p>
            <div>
              <strong>{categoryCounts[name] || 0}</strong>
              <span>篇文档</span>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

function ArticlePage({ post, author, setPage, setCategoryFilter }) {
  post = post || fallbackPosts[0];
  const markdown = post.content || post.excerpt || "";
  const articleHTML = useMemo(() => renderMarkdown(markdown), [markdown]);
  const tocItems = useMemo(() => extractToc(markdown), [markdown]);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const quote = post.excerpt || "慢慢写，长期维护，让每篇文章都能被重新找到。";

  useEffect(() => {
    if (!tocItems.length) {
      setActiveHeadingId("");
      return undefined;
    }

    const updateActiveHeading = () => {
      const headings = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean);
      const current = headings.reduce((active, heading) => {
        const top = heading.getBoundingClientRect().top;
        return top <= 120 ? heading : active;
      }, headings[0]);

      setActiveHeadingId(current?.id || tocItems[0].id);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [tocItems, articleHTML]);

  return (
    <>
      <article className="article-content">
        <nav className="breadcrumbs" aria-label="面包屑导航">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("");
              setPage("blog");
            }}
          >
            博客
          </button>
          <Icon>chevron_right</Icon>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter(post.category || "未分类");
              setPage("blog");
            }}
          >
            {post.category || "未分类"}
          </button>
          <Icon>chevron_right</Icon>
          <strong>{post.title}</strong>
        </nav>
        <header className="article-header">
          <h1>{post.title}</h1>
          <div className="byline">
            <span className="avatar">
              <Icon>person</Icon>
            </span>
            <strong>{author.name || "外城"}</strong>
            <span>{post.date}</span>
            <span>
              <Icon>schedule</Icon> {post.read}
            </span>
          </div>
        </header>
        {post.image && (
          <figure className="article-title-image">
            <img src={mediaURL(post.image)} alt={`${post.title} 标题图`} />
          </figure>
        )}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: articleHTML }} />
        <footer className="article-actions">
          <button>
            <Icon>thumb_up</Icon> 有帮助
          </button>
          <button>
            <Icon>share</Icon> 分享
          </button>
        </footer>
      </article>
      <aside className="toc article-toc" aria-label="文章目录">
        <h4>目录</h4>
        <nav>
          {tocItems.length ? (
            tocItems.map((item) => (
              <a className={`${activeHeadingId === item.id ? "active" : ""} depth-${item.depth}`} href={`#${item.id}`} key={item.id}>
                {item.title}
              </a>
            ))
          ) : (
            <span>暂无目录</span>
          )}
        </nav>
        <div className="insight">
          <span>关于本文</span>
          <p>“{quote}”</p>
        </div>
      </aside>
    </>
  );
}

function CodeBlock() {
  return (
    <div className="code-panel">
      <div className="code-title">
        <span className="traffic red" />
        <span className="traffic amber" />
        <span className="traffic green" />
        <strong>package.json</strong>
        <button>
          <Icon>content_copy</Icon> 复制
        </button>
      </div>
      <pre>{`{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1"
  }
}`}</pre>
    </div>
  );
}

function AuthorPage({ author, adminSummary, setPage }) {
  return (
    <div className="content-wrap page-pad">
      <section className="about-grid">
        <article className="author-card">
          <img src={author.avatar || img.author} alt="外城小站作者肖像" />
          <div>
            <div className="author-heading">
              <h1>{author.name}</h1>
              <span>{author.role}</span>
            </div>
            <p className="handle">{author.handle}</p>
            <p>
              {author.bio}
            </p>
            <div className="link-row">
              <button onClick={() => setPage("admin")}>
                <Icon>admin_panel_settings</Icon> 作者后台
              </button>
              <button>
                <Icon>terminal</Icon> GitHub
              </button>
              <button>
                <Icon>podcasts</Icon> 信号
              </button>
              <button>
                <Icon>alternate_email</Icon> 联系
              </button>
            </div>
          </div>
        </article>
        <aside className="stats-card">
          <h4>小站数据</h4>
          <p>
            <span>已发布</span>
            <strong>{adminSummary.posts - adminSummary.drafts}</strong>
          </p>
          <p>
            <span>标签</span>
            <strong>{adminSummary.tags}</strong>
          </p>
          <p>
            <span>草稿</span>
            <strong>{adminSummary.drafts}</strong>
          </p>
        </aside>
      </section>
      <SectionHeader title="作者说明" eyebrow="当前阶段普通用户不开放登录" />
      <section className="result-list">
        <article>
          <CategoryLabel post={{ category: "原则", color: "primary" }} />
          <h3>先写作，再扩展功能</h3>
          <p>普通访客可以阅读博客、浏览作者信息和标签云。登录、评论、订阅管理等功能暂不对普通用户开放。</p>
        </article>
        <article>
          <CategoryLabel post={{ category: "后台", color: "secondary" }} />
          <h3>作者后台仅作为管理入口</h3>
          <p>后台用于文章、标签和草稿管理。当前是前端原型，后续可接入真实鉴权和内容接口。</p>
        </article>
      </section>
    </div>
  );
}

const emptyEditorPost = {
  title: "",
  slug: "",
  category: "随笔",
  color: "primary",
  excerpt: "",
  content: "",
  image: "",
  status: "draft",
};

const categoryOptions = ["随笔", "前端", "工程", "阅读", "项目", "标签"];

function newEditorDraft() {
  return {
    ...emptyEditorPost,
    title: `新文章 ${new Date().toLocaleString("zh-CN")}`,
    excerpt: "这是一篇新的草稿摘要，用来说明文章的核心内容。",
    content: "# 新文章\n\n在这里使用 Markdown 编写正文。\n\n- 可以写列表\n- 可以写代码片段\n- 发布前正文至少需要二十个字符\n",
  };
}

function toEditorDraft(post) {
  return {
    id: post.id,
    title: post.title || "",
    slug: post.slug || "",
    category: post.category || "随笔",
    color: post.color || "primary",
    excerpt: post.excerpt || "",
    content: post.content || "",
    image: post.image || "",
    status: post.status || "draft",
  };
}

function estimateReadTime(content) {
  const length = [...(content || "").trim()].length;
  return `${Math.max(1, Math.ceil(length / 500))} 分钟阅读`;
}

function AdminPage({ posts, adminSummary, onNewPost, onEditPost, onUpdatePostStatus, onDeletePost }) {
  const adminPosts = posts.slice(0, 5);
  const [adminMessage, setAdminMessage] = useState("列表中的发布会执行内容校验；失败时请进入编辑器补齐标题、摘要和正文。");

  async function changeStatus(post) {
    const nextStatus = post.status === "draft" ? "published" : "draft";
    const result = await onUpdatePostStatus(post, nextStatus);
    if (result?.error) {
      setAdminMessage(`操作失败：${result.error}。请点击"编辑"进入 Markdown 编辑器完善内容。`);
      return;
    }
    setAdminMessage(nextStatus === "published" ? "文章已发布。" : "文章已撤回为草稿。");
  }

  async function removePost(post) {
    const result = await onDeletePost(post);
    if (result?.error) {
      setAdminMessage(`删除失败：${result.error}`);
      return;
    }
    setAdminMessage("文章已删除。");
  }

  return (
    <div className="content-wrap page-pad admin-page">
      <header className="page-hero">
        <div className="signal">
          <i />
          <span>作者后台</span>
        </div>
        <h1>内容管理台</h1>
        <p>面向作者的后台原型，用于管理文章、草稿、标签和发布状态。普通用户侧当前不提供登录入口。</p>
      </header>

      <section className="admin-metrics">
        {[
          ["文章总数", String(adminSummary.posts), "article"],
          ["草稿", String(adminSummary.drafts), "draft"],
          ["标签", String(adminSummary.tags), "sell"],
          ["本月更新", String(adminSummary.monthPosts), "calendar_month"],
        ].map(([label, value, icon]) => (
          <article key={label}>
            <Icon>{icon}</Icon>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-grid">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>文章管理</h2>
            <button className="primary-button" onClick={onNewPost}>新建文章</button>
          </div>
          <p className="admin-message">{adminMessage}</p>
          <div className="admin-table">
            {adminPosts.map((post) => (
              <div className="admin-row" key={post.slug || post.title}>
                <span>{post.title}</span>
                <em>{post.status === "draft" ? "草稿" : "已发布"}</em>
                <time>{post.date}</time>
                <div className="admin-row-actions">
                  <button onClick={() => onEditPost(post)}>编辑</button>
                  <button onClick={() => changeStatus(post)}>
                    {post.status === "draft" ? "发布" : "撤回"}
                  </button>
                  <button onClick={() => removePost(post)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>写作流程</h2>
          </div>
          <div className="admin-actions">
            <button onClick={onNewPost}>
              <Icon>edit_square</Icon>
              打开全屏 Markdown 编辑器
            </button>
            <button>
              <Icon>schedule</Icon>
              阅读时间会根据正文自动估算
            </button>
            <button>
              <Icon>task_alt</Icon>
              发布前会校验标题、摘要和正文长度
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

function EditorPage({ draft, setDraft, onSavePost, setPage }) {
  const [message, setMessage] = useState("原生 Markdown 编辑模式：当前不提供在线转换或预览。");
  const [uploadingImage, setUploadingImage] = useState(false);
  const readTime = estimateReadTime(draft.content);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save(status) {
    const saved = await onSavePost({ ...draft, readTime, status });
    if (saved?.error) {
      setMessage(`保存失败：${saved.error}`);
      return;
    }
    setMessage(status === "published" ? "文章已发布。" : "草稿已保存。");
    if (saved) setDraft(toEditorDraft(normalizePost(saved)));
  }

  async function handleImageUpload(file) {
    if (!file) return;
    setUploadingImage(true);
    setMessage("正在上传标题图片...");
    const uploaded = await uploadImage(file);
    setUploadingImage(false);
    if (uploaded?.error) {
      setMessage(`图片上传失败：${uploaded.error}`);
      return;
    }
    updateDraft("image", mediaURL(uploaded.path || uploaded.url));
    setMessage("标题图片已上传，保存草稿或发布后会应用到文章。");
  }

  return (
    <div className="content-wrap page-pad editor-page">
      <header className="editor-hero">
        <div>
          <div className="signal">
            <i />
            <span>Markdown 编辑器</span>
          </div>
          <h1>{draft.id ? "编辑文章" : "新建文章"}</h1>
          <p>使用原生 Markdown 编写正文。保存草稿不会要求内容完整，发布时会执行内容校验。</p>
        </div>
        <button className="section-back" onClick={() => setPage("admin")}>
          <Icon>arrow_back</Icon>
          返回后台
        </button>
      </header>

      <section className="editor-layout">
        <aside className="editor-sidebar">
          <label>
            标题
            <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
          </label>
          <label>
            分组
            <select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Slug
            <input value={draft.slug} onChange={(event) => updateDraft("slug", event.target.value)} placeholder="留空自动生成" />
          </label>
          <label>
            摘要
            <textarea rows="5" value={draft.excerpt} onChange={(event) => updateDraft("excerpt", event.target.value)} />
          </label>
          <div className="editor-image-field">
            <span>标题图片</span>
            {draft.image ? (
              <img src={mediaURL(draft.image)} alt="文章标题图预览" />
            ) : (
              <div className="editor-image-empty">
                <Icon>image</Icon>
                暂无标题图
              </div>
            )}
            <label className="upload-button">
              <Icon>{uploadingImage ? "hourglass_top" : "upload"}</Icon>
              {uploadingImage ? "上传中" : "上传图片"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploadingImage}
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
              />
            </label>
            {draft.image && (
              <button type="button" className="image-clear" onClick={() => updateDraft("image", "")}>
                移除标题图
              </button>
            )}
          </div>
          <div className="editor-stat">
            <span>预计阅读</span>
            <strong>{readTime}</strong>
          </div>
          <p className="editor-message">{message}</p>
          <div className="editor-actions">
            <button type="button" onClick={() => save("draft")}>保存草稿</button>
            <button className="primary-button" type="button" onClick={() => save("published")}>发布文章</button>
          </div>
        </aside>

        <article className="markdown-editor">
          <div className="markdown-editor-head">
            <span>content.md</span>
            <strong>{[...draft.content].length} 字符</strong>
          </div>
          <textarea
            value={draft.content}
            onChange={(event) => updateDraft("content", event.target.value)}
            spellCheck="false"
            placeholder={"# 标题\n\n在这里编写 Markdown 正文..."}
          />
        </article>
      </section>
    </div>
  );
}

function MissingPage({ setPage }) {
  return (
    <section className="missing">
      <span>404</span>
      <h1>未找到信号</h1>
      <p>请求的页面不在当前外城小站索引中。</p>
      <button className="primary-button" onClick={() => setPage("home")}>
        返回首页
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <strong>外城小站</strong>
      <nav>
        <a href="#privacy">隐私</a>
        <a href="#terms">条款</a>
        <a href="#oss">OSS</a>
        <a href="#changelog">更新日志</a>
      </nav>
      <span>© 2026 外城小站。</span>
    </footer>
  );
}

export default App;
