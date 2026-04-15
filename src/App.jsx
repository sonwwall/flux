import React, { useMemo, useState } from "react";

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

const posts = [
  {
    title: "守护服务网格：微服务架构中的零信任实践",
    category: "系统",
    color: "primary",
    date: "2024 年 3 月 12 日",
    read: "12 分钟阅读",
    image: img.circuit,
    featured: true,
    excerpt:
      "解析复杂云原生环境中的身份化安全模型，以及 SPIFFE 如何成为可落地的信任底座。",
  },
  {
    title: "细微动效：微交互背后的产品心理学",
    category: "界面",
    color: "secondary",
    date: "2024 年 3 月 10 日",
    read: "5 分钟阅读",
    excerpt:
      "为什么最轻量的动画，往往能显著影响用户留存、理解效率与产品质感。",
  },
  {
    title: "向量数据库：现代 RAG 系统背后的检索引擎",
    category: "数据",
    color: "tertiary",
    date: "2024 年 3 月 8 日",
    read: "8 分钟阅读",
    excerpt:
      "语义索引正在重塑非结构化知识的存储、召回与组合推理方式。",
  },
  {
    title: "行星级边缘计算：把延迟压到用户身边",
    category: "基础设施",
    color: "primary-fixed",
    date: "2024 年 3 月 5 日",
    read: "15 分钟阅读",
    image: img.planet,
    featured: true,
    reverse: true,
    excerpt:
      "通过智能工作负载分发与区域缓存，为下一批十亿用户解决延迟问题。",
  },
];

const categories = [
  ["AI 与机器学习", "神经架构", "124", "psychology", "primary"],
  ["系统工程", "内核运行", "89", "dns", "secondary"],
  ["DevOps", "运行时通量", "216", "terminal", "tertiary"],
  ["前端工程", "界面逻辑", "67", "layers", "error"],
  ["安全", "信任边界", "142", "encrypted", "primary-fixed"],
  ["数据", "语义索引", "98", "database", "secondary"],
];

const navItems = [
  ["home", "核心循环", "refresh"],
  ["categories", "系统增强", "memory"],
  ["article", "任务运行时", "terminal"],
];

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function App() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");

  const content = {
    home: <HomePage setPage={setPage} />,
    categories: <CategoriesPage />,
    article: <ArticlePage />,
    about: <AboutSearchPage query={query} setQuery={setQuery} />,
    missing: <MissingPage setPage={setPage} />,
  }[page] ?? <MissingPage setPage={setPage} />;

  return (
    <>
      <TopNav page={page} setPage={setPage} query={query} setQuery={setQuery} />
      <SideNav page={page} setPage={setPage} />
      <main className={`app-shell ${page === "article" ? "article-shell" : ""}`}>{content}</main>
    </>
  );
}

function TopNav({ page, setPage, query, setQuery }) {
  return (
    <header className="top-nav">
      <button className="brand" onClick={() => setPage("home")} aria-label="flux 首页">
        flux
      </button>
      <nav className="top-links" aria-label="主导航">
        {[
          ["home", "文档"],
          ["categories", "专题"],
          ["about", "作者"],
          ["article", "主题"],
        ].map(([id, label]) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
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
            onFocus={() => setPage("about")}
            placeholder="搜索洞察..."
          />
        </label>
        <button className="icon-button" aria-label="设置">
          <Icon>settings</Icon>
        </button>
        <button className="icon-button" aria-label="个人资料">
          <Icon>account_circle</Icon>
        </button>
      </div>
    </header>
  );
}

function SideNav({ page, setPage }) {
  return (
    <aside className="side-nav">
      <div className="side-kicker">
        <strong>导航</strong>
        <span>技术索引</span>
      </div>
      <nav aria-label="技术索引">
        {navItems.map(([id, label, icon], index) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
            <i className={`dot dot-${index}`} />
            <Icon>{icon}</Icon>
            {label}
          </button>
        ))}
      </nav>
      <div className="side-footer">
        <button onClick={() => setPage("about")}>
          <Icon>help</Icon>
          支持
        </button>
        <button onClick={() => setPage("missing")}>
          <Icon>history</Icon>
          归档
        </button>
      </div>
    </aside>
  );
}

function HomePage({ setPage }) {
  return (
    <div className="content-wrap">
      <section className="hero">
        <img src={img.hero} alt="抽象神经网络数据流" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <div className="meta-row">
            <span className="pill gradient">精选</span>
            <span>2024 年 3 月 14 日</span>
          </div>
          <h1>量子跃迁：构建下一代分布式共识架构</h1>
          <p>
            深入拆解正在定义未来十年去中心化计算与高并发系统的算法变革。
          </p>
          <button className="primary-button" onClick={() => setPage("article")}>
            阅读完整洞察 <Icon>arrow_forward</Icon>
          </button>
        </div>
      </section>

      <SectionHeader
        title="最新洞察"
        eyebrow="技术信息流 / v2.04"
        actions={["筛选", "排序"]}
      />

      <section className="post-grid">
        {posts.map((post) =>
          post.featured ? <WidePostCard key={post.title} post={post} /> : <PostCard key={post.title} post={post} />,
        )}
      </section>

      <section className="newsletter">
        <div>
          <h2>每周信号</h2>
          <p>
            和工程师、架构师一起接收精选技术进展摘要，以及面向未来的深度编辑文章。
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

function WidePostCard({ post }) {
  return (
    <article className={`post-card wide ${post.reverse ? "reverse" : ""}`}>
      <div className="post-media">
        <img src={post.image} alt="" />
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

function PostCard({ post }) {
  return (
    <article className="post-card compact">
      <div>
        <CategoryLabel post={post} />
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
      <CardMeta post={post} />
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

function CategoriesPage() {
  return (
    <div className="content-wrap page-pad">
      <header className="page-hero">
        <div className="signal">
          <i />
          <span>系统分类</span>
        </div>
        <h1>知识集群</h1>
        <p>
          探索经过策展的技术领域。每个集群都是 flux 编辑体系的一根支柱，从基础设施编排到神经合成。
        </p>
      </header>
      <section className="category-grid">
        {categories.map(([name, subtitle, count, icon, color]) => (
          <article className="category-card" key={name}>
            <Icon className="ghost-icon">{icon}</Icon>
            <i className={`glow ${color}`} />
            <h3>{name}</h3>
            <p>{subtitle}</p>
            <div>
              <strong>{count}</strong>
              <span>篇文档</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function ArticlePage() {
  return (
    <>
      <article className="article-content">
        <nav className="breadcrumbs" aria-label="面包屑导航">
          文档 <Icon>chevron_right</Icon> 引擎架构 <Icon>chevron_right</Icon>
          <strong>运行时优化</strong>
        </nav>
        <header className="article-header">
          <h1>优化分布式神经网格中的并发运行时延迟</h1>
          <div className="byline">
            <span className="avatar">
              <Icon>person</Icon>
            </span>
            <strong>阿里斯·索恩博士</strong>
            <span>2024 年 10 月 24 日</span>
            <span>
              <Icon>schedule</Icon> 12 分钟阅读
            </span>
          </div>
        </header>
        <p className="lead">
          分布式神经网格在高并发环境下面临的核心挑战，往往集中在遥测数据的编排上。随着节点规模扩张，传统线性运行时模型很难维持 10 毫秒以内的延迟。
        </p>
        <div className="callout">
          <Icon>priority_high</Icon>
          <div>
            <h3>关键运行时约束</h3>
            <p>
              任何启用 <code>--strict-sync</code> 标记的部署，都必须确保主时钟漂移小于 5 微秒。
            </p>
          </div>
        </div>
        <h2>异步缓冲区分配</h2>
        <p>
          神经网格中的高效内存管理需要跳出标准垃圾回收路径。通过在硬件抽象层采用环形缓冲区策略，可以绕过堆分配带来的额外开销。
        </p>
        <CodeBlock />
        <h2>网格拓扑与收敛</h2>
        <p>
          缓冲区完成分配后，网格必须就拓扑结构达成共识。在三层层级中，核心循环处理高优先级中断，系统增强层处理后台启发式任务。
        </p>
        <figure>
          <img src={img.article} alt="带有蓝色发光路径的复杂电路板" />
          <figcaption>图 1.2：神经网格互连示意</figcaption>
        </figure>
        <p>
          迁移到异步运行时代表着神经架构的一次重要跃迁。后续迭代将聚焦任务运行时层中的预测式缓存预取。
        </p>
        <footer className="article-actions">
          <button>
            <Icon>thumb_up</Icon> 有帮助
          </button>
          <button>
            <Icon>share</Icon> 分享
          </button>
          <div>
            <span>架构</span>
            <span>优化</span>
          </div>
        </footer>
      </article>
      <aside className="toc">
        <h4>本页目录</h4>
        {["概览", "关键运行时约束", "缓冲区分配", "拓扑收敛", "未来迭代"].map(
          (item, index) => (
            <a className={index === 0 ? "active" : ""} href="#root" key={item}>
              {item}
            </a>
          ),
        )}
        <div className="insight">
          <span>技术洞察</span>
          <p>“现代分布式网格的瓶颈不在计算，而在共识速度。”</p>
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
        <strong>runtime_core.cpp</strong>
        <button>
          <Icon>content_copy</Icon> 复制
        </button>
      </div>
      <pre>{`template <typename T>
class NeuralBuffer {
  void allocate(size_t capacity) {
    auto alignment = 64;
    posix_memalign(&data_, alignment, capacity * sizeof(T));

    for (int i = 0; i < capacity; ++i) {
      data_[i] = nullptr;
    }
  }
};`}</pre>
    </div>
  );
}

function AboutSearchPage({ query, setQuery }) {
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) => `${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <div className="content-wrap page-pad">
      <section className="search-hero">
        <Icon>search</Icon>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索技术文档、系统日志或作者..."
        />
        <kbd>⌘K</kbd>
      </section>
      <section className="about-grid">
        <article className="author-card">
          <img src={img.author} alt="flux 首席架构师肖像" />
          <div>
            <div className="author-heading">
              <h1>伊莱亚斯·万斯博士</h1>
              <span>首席架构师</span>
            </div>
            <p className="handle">@vance_runtime / 系统完整性部门</p>
            <p>
              专注于低延迟运行时优化与神经接口内核模块。万斯负责维护 flux 核心循环中的技术分类体系。
            </p>
            <div className="link-row">
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
          <h4>作者数据</h4>
          <p>
            <span>贡献</span>
            <strong>1,248</strong>
          </p>
          <p>
            <span>影响因子</span>
            <strong>9.82</strong>
          </p>
          <p>
            <span>活跃节点</span>
            <strong>14</strong>
          </p>
        </aside>
      </section>
      <SectionHeader title="热门搜索" eyebrow={`${results.length} 条匹配信号`} />
      <section className="result-list">
        {results.map((post) => (
          <article key={post.title}>
            <CategoryLabel post={post} />
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function MissingPage({ setPage }) {
  return (
    <section className="missing">
      <span>404</span>
      <h1>未找到信号</h1>
      <p>请求的归档节点不在当前 flux 索引中。</p>
      <button className="primary-button" onClick={() => setPage("home")}>
        返回核心循环
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <strong>flux</strong>
      <nav>
        <a href="#privacy">隐私</a>
        <a href="#terms">条款</a>
        <a href="#oss">OSS</a>
        <a href="#changelog">更新日志</a>
      </nav>
      <span>© 2026 FLUX 归档。</span>
    </footer>
  );
}

export default App;
