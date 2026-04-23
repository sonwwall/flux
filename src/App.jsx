import React, { useEffect, useMemo, useState } from "react";
import { getToken, setToken, clearToken } from "./services/auth";
import { loadJSON, apiJSON } from "./services/api";
import { uploadImage } from "./services/upload";
import { renderMarkdown, extractToc } from "./lib/markdown";
import {
  normalizePost,
  normalizeTag,
  toEditorDraft,
  newEditorDraft,
  estimateReadTime,
  mediaURL,
} from "./lib/post";
import {
  fallbackImages as img,
  fallbackPosts,
  fallbackTags,
  navItems,
  fallbackAuthor,
  fallbackSiteConfig,
  fallbackAdminSummary,
  emptyEditorPost,
  categoryOptions,
} from "./data/fallback";
import { useHashRoute } from "./hooks/useHashRoute";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function App() {
  const [page, setPageState] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "home";
  });

  const setPage = (p) => {
    window.location.hash = p;
    setPageState(p);
  };
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

  const goAdmin = () => getToken() ? setPage("admin") : setShowLogin(true);

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const [postData, tagData, authorData, siteData] = await Promise.all([
      loadJSON("/api/posts"),
      loadJSON("/api/tags"),
      loadJSON("/api/author"),
      loadJSON("/api/admin/site"),
    ]);
    const [adminPostData, summaryData] = await Promise.all([
      apiJSON("/api/admin/posts"),
      apiJSON("/api/admin/summary"),
    ]);

    if (postData) setPosts(postData.map(normalizePost));
    if (adminPostData && !adminPostData.error) setAdminPosts(adminPostData.map(normalizePost));
    if (tagData) setTags(tagData.map(normalizeTag));
    if (authorData) setAuthor(authorData);
    if (summaryData && !summaryData.error) setAdminSummary(summaryData);
    if (siteData && !siteData.error) setSiteConfig(siteData);

    setApiStatus([postData, tagData, authorData].some(Boolean) ? "online" : "offline");
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

  async function saveAuthor(data) {
    const saved = await apiJSON("/api/author", { method: "PUT", body: data });
    if (saved && !saved.error) setAuthor(saved);
    return saved;
  }

  async function saveSiteConfig(data) {
    const saved = await apiJSON("/api/admin/site", { method: "PUT", body: data });
    if (saved && !saved.error) setSiteConfig(saved);
    return saved;
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
    home: <HomePage posts={posts} siteConfig={siteConfig} setPage={setPage} onSelectPost={setSelectedPost} />,
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
    author: <AuthorPage author={author} adminSummary={adminSummary} setPage={setPage} goAdmin={goAdmin} />,
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
        onEditAuthor={() => setPage("authorEditor")}
        onEditSite={() => setPage("siteConfigEditor")}
      />
    ),
    editor: <EditorPage draft={editorDraft} setDraft={setEditorDraft} onSavePost={saveEditorPost} setPage={setPage} />,
    authorEditor: <AuthorEditorPage author={author} onSave={saveAuthor} setPage={setPage} />,
    siteConfigEditor: <SiteConfigEditorPage siteConfig={siteConfig} onSave={saveSiteConfig} setPage={setPage} />,
    missing: <MissingPage setPage={setPage} />,
  }[page] ?? <MissingPage setPage={setPage} />;

  return (
    <>
      <TopNav page={page} setPage={setPage} query={query} setQuery={setQuery} apiStatus={apiStatus} setCategoryFilter={setCategoryFilter} />
      <SideNav page={page} setPage={setPage} setCategoryFilter={setCategoryFilter} goAdmin={goAdmin} />
      <main className={`app-shell ${page === "article" ? "article-shell" : ""}`}>{content}</main>
      {showLogin && <LoginDialog onSuccess={(token) => { setToken(token); setShowLogin(false); refreshData().then(() => setPage("admin")); }} onClose={() => setShowLogin(false)} />}
    </>
  );
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

function SideNav({ page, setPage, setCategoryFilter, goAdmin }) {
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
        <button onClick={goAdmin}>
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

function HomePage({ posts, siteConfig, setPage, onSelectPost }) {
  const heroImage = mediaURL(siteConfig?.heroImage) || img.hero;

  return (
    <div className="content-wrap">
      <section className="hero">
        <img src={heroImage} alt="外城小站首页标题图" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <div className="meta-row">
            <span className="pill gradient">{siteConfig?.heroSubtitle || "外城小站"}</span>
          </div>
          <h1>{siteConfig?.heroTitle || "在外城边缘，记录技术、阅读与日常。"}</h1>
          <p>{siteConfig?.heroDesc || ""}</p>
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
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const term = query.trim();
    if (!term) { setSearchResults(null); return; }
    loadJSON(`/api/posts?q=${encodeURIComponent(term)}`).then((data) => {
      if (data) setSearchResults(data.map(normalizePost));
    });
  }, [query]);

  const results = useMemo(() => {
    const base = searchResults ?? posts;
    return base.filter((post) => !categoryFilter || post.category === categoryFilter);
  }, [searchResults, posts, query, categoryFilter]);

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

function AuthorPage({ author, adminSummary, setPage, goAdmin }) {
  const [copied, setCopied] = useState(false);

  function copyContact() {
    if (!author.contact) return;
    navigator.clipboard.writeText(author.contact).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            <p>{author.bio}</p>
            <div className="link-row">
              <button onClick={goAdmin}>
                <Icon>admin_panel_settings</Icon> 作者后台
              </button>
              {author.github && (
                <a href={author.github} target="_blank" rel="noopener noreferrer" className="link-row-btn">
                  <Icon>terminal</Icon> GitHub
                </a>
              )}
              {author.contact && (
                <button onClick={copyContact}>
                  <Icon>alternate_email</Icon> {copied ? "已复制" : "联系"}
                </button>
              )}
            </div>
          </div>
        </article>
        <aside className="stats-card">
          <h4>小站数据</h4>
          <p><span>已发布</span><strong>{adminSummary.posts - adminSummary.drafts}</strong></p>
          <p><span>标签</span><strong>{adminSummary.tags}</strong></p>
          <p><span>草稿</span><strong>{adminSummary.drafts}</strong></p>
        </aside>
      </section>
      <SectionHeader title="作者说明" eyebrow={author.noteSubtitle || ""} />
      <section className="result-list">
        {(author.notes || []).map((note, i) => (
          <article key={i}>
            <CategoryLabel post={{ category: note.label || "说明", color: i % 2 === 0 ? "primary" : "secondary" }} />
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function AdminPage({ posts, adminSummary, onNewPost, onEditPost, onUpdatePostStatus, onDeletePost, onEditAuthor, onEditSite }) {
  const adminPosts = posts;
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
          <div className="admin-table" style={{ maxHeight: 320, overflowY: "auto" }}>
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
            <h2>其他设置</h2>
          </div>
          <div className="admin-actions">
            <button onClick={onEditSite}>
              <Icon>home</Icon>
              编辑首页
            </button>
            <button onClick={onEditAuthor}>
              <Icon>manage_accounts</Icon>
              编辑作者页面
            </button>
          </div>
          <ChangeSecretForm />
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

function AuthorEditorPage({ author, onSave, setPage }) {
  const [draft, setDraft] = useState({ ...author });
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarUpload(file) {
    if (!file) return;
    setUploadingAvatar(true);
    setMessage("正在上传头像...");
    const uploaded = await uploadImage(file);
    setUploadingAvatar(false);
    if (uploaded?.error) {
      setMessage(`头像上传失败：${uploaded.error}`);
      return;
    }
    setDraft((d) => ({ ...d, avatar: mediaURL(uploaded.path || uploaded.url) }));
    setMessage("头像已上传。");
  }

  function update(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  async function handleSave() {
    const result = await onSave(draft);
    if (result?.error) {
      setMessage(`保存失败：${result.error}`);
      return;
    }
    setMessage("作者信息已保存。");
  }

  return (
    <div className="content-wrap page-pad editor-page">
      <header className="editor-hero">
        <div>
          <div className="signal"><i /><span>作者后台</span></div>
          <h1>编辑作者页面</h1>
          <p>修改作者简介、头像链接和社交信息，保存后立即生效。</p>
        </div>
        <button className="section-back" onClick={() => setPage("admin")}>
          <Icon>arrow_back</Icon>
          返回后台
        </button>
      </header>
      <section className="editor-layout">
        <aside className="editor-sidebar">
          <label>
            名称
            <input value={draft.name || ""} onChange={(e) => update("name", e.target.value)} />
          </label>
          <label>
            身份 / 角色
            <input value={draft.role || ""} onChange={(e) => update("role", e.target.value)} />
          </label>
          <label>
            Handle
            <input value={draft.handle || ""} onChange={(e) => update("handle", e.target.value)} />
          </label>
          <label>
            简介
            <textarea rows="5" value={draft.bio || ""} onChange={(e) => update("bio", e.target.value)} />
          </label>
          <div className="editor-image-field">
            <span>头像</span>
            {draft.avatar ? (
              <img src={mediaURL(draft.avatar)} alt="头像预览" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div className="editor-image-empty"><Icon>person</Icon>暂无头像</div>
            )}
            <label className="upload-button">
              <Icon>{uploadingAvatar ? "hourglass_top" : "upload"}</Icon>
              {uploadingAvatar ? "上传中" : "上传头像"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploadingAvatar} onChange={(e) => handleAvatarUpload(e.target.files?.[0])} />
            </label>
            {draft.avatar && (
              <button type="button" className="image-clear" onClick={() => setDraft((d) => ({ ...d, avatar: "" }))}>移除头像</button>
            )}
          </div>
          <label>
            GitHub URL
            <input value={draft.github || ""} onChange={(e) => update("github", e.target.value)} />
          </label>
          <label>
            联系方式
            <input value={draft.contact || ""} onChange={(e) => update("contact", e.target.value)} placeholder="邮箱、微信号等，点击联系时复制" />
          </label>
          <label>
            说明副标题
            <input value={draft.noteSubtitle || ""} onChange={(e) => update("noteSubtitle", e.target.value)} />
          </label>
          <div className="editor-image-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>作者说明</span>
              <button className="primary-button" type="button" onClick={() => update("notes", [...(draft.notes || []), { label: "", title: "", body: "" }])}>
                <Icon>add</Icon> 新增说明
              </button>
            </div>
            {(draft.notes || []).map((note, i) => (
              <div key={i} style={{ border: "1px solid var(--border, #333)", borderRadius: "var(--radius, 6px)", padding: "10px", marginTop: 8 }}>
                <label>
                  标签（如"原则"）
                  <input value={note.label || ""} onChange={(e) => {
                    const notes = draft.notes.map((n, j) => j === i ? { ...n, label: e.target.value } : n);
                    update("notes", notes);
                  }} />
                </label>
                <label>
                  标题
                  <input value={note.title} onChange={(e) => {
                    const notes = draft.notes.map((n, j) => j === i ? { ...n, title: e.target.value } : n);
                    update("notes", notes);
                  }} />
                </label>
                <label>
                  内容
                  <textarea rows="3" value={note.body} onChange={(e) => {
                    const notes = draft.notes.map((n, j) => j === i ? { ...n, body: e.target.value } : n);
                    update("notes", notes);
                  }} />
                </label>
                <button className="primary-button" type="button" style={{ marginTop: 6 }} onClick={() => update("notes", draft.notes.filter((_, j) => j !== i))}>
                  <Icon>delete</Icon> 删除
                </button>
              </div>
            ))}
          </div>
          {message && <p className="editor-message">{message}</p>}
          <div className="editor-actions">
            <button type="button" onClick={() => setPage("admin")}>取消</button>
            <button className="primary-button" type="button" onClick={handleSave}>保存</button>
          </div>
        </aside>
        <article className="admin-panel" style={{ flex: 1 }}>
          <div className="admin-panel-head"><h2>预览</h2></div>
          <div className="author-card" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", padding: "1.5rem" }}>
            <img src={mediaURL(draft.avatar) || img.author} alt="头像" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div className="author-heading">
                <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{draft.name || "（名称）"}</h1>
                <span>{draft.role || "（角色）"}</span>
              </div>
              <p className="handle">{draft.handle || "（handle）"}</p>
              <p style={{ margin: "0.5rem 0 0" }}>{draft.bio || "（简介）"}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function SiteConfigEditorPage({ siteConfig, onSave, setPage }) {
  const [draft, setDraft] = useState({ ...siteConfig });
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  function update(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  async function handleImageUpload(file) {
    if (!file) return;
    setUploadingImage(true);
    setMessage("正在上传图片...");
    const uploaded = await uploadImage(file);
    setUploadingImage(false);
    if (uploaded?.error) { setMessage(`上传失败：${uploaded.error}`); return; }
    update("heroImage", mediaURL(uploaded.path || uploaded.url));
    setMessage("图片已上传。");
  }

  async function handleSave() {
    const result = await onSave(draft);
    if (result?.error) { setMessage(`保存失败：${result.error}`); return; }
    setMessage("首页配置已保存。");
  }

  return (
    <div className="content-wrap page-pad editor-page">
      <header className="editor-hero">
        <div>
          <div className="signal"><i /><span>作者后台</span></div>
          <h1>编辑首页</h1>
          <p>修改首页 Hero 区域的标题、描述和背景图片。</p>
        </div>
        <button className="section-back" onClick={() => setPage("admin")}>
          <Icon>arrow_back</Icon>返回后台
        </button>
      </header>
      <section className="editor-layout">
        <aside className="editor-sidebar">
          <label>
            标题
            <input value={draft.heroTitle || ""} onChange={(e) => update("heroTitle", e.target.value)} />
          </label>
          <label>
            副标题（pill 标签）
            <input value={draft.heroSubtitle || ""} onChange={(e) => update("heroSubtitle", e.target.value)} />
          </label>
          <label>
            描述
            <textarea rows="4" value={draft.heroDesc || ""} onChange={(e) => update("heroDesc", e.target.value)} />
          </label>
          <div className="editor-image-field">
            <span>背景图片</span>
            {draft.heroImage ? (
              <img src={mediaURL(draft.heroImage)} alt="Hero 预览" style={{ width: "100%", borderRadius: "var(--radius)", objectFit: "cover", maxHeight: 120 }} />
            ) : (
              <div className="editor-image-empty"><Icon>image</Icon>暂无背景图</div>
            )}
            <label className="upload-button">
              <Icon>{uploadingImage ? "hourglass_top" : "upload"}</Icon>
              {uploadingImage ? "上传中" : "上传图片"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploadingImage} onChange={(e) => handleImageUpload(e.target.files?.[0])} />
            </label>
            {draft.heroImage && (
              <button type="button" className="image-clear" onClick={() => update("heroImage", "")}>移除图片</button>
            )}
          </div>
          {message && <p className="editor-message">{message}</p>}
          <div className="editor-actions">
            <button type="button" onClick={() => setPage("admin")}>取消</button>
            <button className="primary-button" type="button" onClick={handleSave}>保存</button>
          </div>
        </aside>
        <article className="admin-panel" style={{ flex: 1 }}>
          <div className="admin-panel-head"><h2>预览</h2></div>
          <div style={{ position: "relative", borderRadius: "var(--radius)", overflow: "hidden", minHeight: 160 }}>
            <img src={mediaURL(draft.heroImage) || img.hero} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            <div className="hero-shade" />
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
              <span className="pill gradient" style={{ fontSize: "0.75rem" }}>{draft.heroSubtitle || "外城小站"}</span>
              <h3 style={{ margin: "8px 0 4px", color: "#fff" }}>{draft.heroTitle || "（标题）"}</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{draft.heroDesc || "（描述）"}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function ChangeSecretForm() {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");

  async function handleChange() {
    if (!secret.trim()) return;
    const result = await apiJSON("/api/auth/change-secret", { method: "POST", body: { secret } });
    if (result?.error) { setMessage(`失败：${result.error}`); return; }
    clearToken();
    setSecret("");
    setMessage("密钥已更新，请重新登录。");
  }

  return (
    <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border, rgba(255,255,255,0.08))" }}>
      <div className="admin-panel-head" style={{ marginBottom: "0.75rem" }}>
        <h2>修改密钥</h2>
      </div>
      <label>
        新密钥
        <input type="text" style={{ WebkitTextSecurity: "disc" }} value={secret} onChange={(e) => setSecret(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChange()} />
      </label>
      {message && <p className="admin-message" style={{ marginTop: "0.5rem" }}>{message}</p>}
      <div style={{ marginTop: "0.75rem" }}>
        <button className="primary-button" type="button" onClick={handleChange}>保存密钥</button>
      </div>
    </div>
  );
}

function LoginDialog({ onSuccess, onClose }) {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!secret.trim()) return;
    setLoading(true);
    const result = await apiJSON("/api/auth/login", { method: "POST", body: { secret } });
    setLoading(false);
    if (result?.error) { setMessage("密钥错误"); return; }
    onSuccess(result.token);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "2rem", width: 320, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>进入作者后台</h2>
        <label>
          密钥
          <input
            type="text"
            style={{ WebkitTextSecurity: "disc" }}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoFocus
          />
        </label>
        {message && <p className="editor-message">{message}</p>}
        <div className="editor-actions">
          <button type="button" onClick={onClose}>取消</button>
          <button className="primary-button" type="button" onClick={handleLogin} disabled={loading}>
            {loading ? "验证中" : "进入"}
          </button>
        </div>
      </div>
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
