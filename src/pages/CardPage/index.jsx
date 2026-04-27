import { useState } from "react";
import { fallbackImages } from "../../data/fallback";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

function SocialGlyph({ name }) {
  const glyphs = {
    github: (
      <path
        d="M12 2C6.48 2 2 6.58 2 12.22c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.54 1.06 1.54 1.06.9 1.57 2.35 1.12 2.93.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.15-4.55-5.11 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.33.1-2.77 0 0 .84-.28 2.75 1.07A9.35 9.35 0 0 1 12 6.84c.85 0 1.71.12 2.51.37 1.91-1.35 2.75-1.07 2.75-1.07.55 1.44.2 2.51.1 2.77.64.73 1.03 1.66 1.03 2.79 0 3.97-2.33 4.84-4.56 5.1.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.2 10.2 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"
        fill="currentColor"
      />
    ),
    twitter: (
      <path
        d="M18.9 3H21l-4.6 5.26L22 21h-4.42l-3.46-4.53L10.16 21H8.05l4.92-5.62L2 3h4.54l3.13 4.14L12.9 3h2.1L11.5 7.02 18.9 3Zm-1.55 15.37h1.23L6.04 5.54H4.73l12.62 12.83Z"
        fill="currentColor"
      />
    ),
    email: (
      <path
        d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.2 2 7.54 5.66a.5.5 0 0 0 .52 0L19.8 7H4.2Zm15.8 10V8.25l-6.94 5.21a2.5 2.5 0 0 1-3.12 0L3 8.25V17h17Z"
        fill="currentColor"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {glyphs[name]}
    </svg>
  );
}

export function CardPage({ author, siteConfig, adminSummary, posts, setPage }) {
  const [flipped, setFlipped] = useState(false);
  const avatar = mediaURL(author?.avatar) || fallbackImages.author;
  const intro = siteConfig?.heroTitle || "在外城边缘，记录技术、阅读与日常。";
  const summary = author?.bio || "把前端工程、个人项目和阅读记录，沉淀成一个可长期维护的小站。";
  const email = author?.contact || "hello@outercity.dev";
  const publishedCount = Math.max((adminSummary?.posts || posts?.length || 0) - (adminSummary?.drafts || 0), 0);
  const heroPost = posts?.[0] || {};
  const showcaseCards = [
    {
      eyebrow: "Latest Entry",
      title: heroPost.title || "最近更新",
      body: heroPost.excerpt || "继续整理博客内容、页面结构和主题细节。",
      image: mediaURL(heroPost.image) || fallbackImages.circuit,
      icon: "deployed_code",
    },
    {
      eyebrow: "Writing Rule",
      title: author?.notes?.[0]?.title || "先写作，再扩展功能",
      body: author?.notes?.[0]?.body || "先保证内容沉淀，再逐步接入更复杂的能力。",
      image: fallbackImages.planet,
      icon: "auto_stories",
    },
    {
      eyebrow: "Station Data",
      title: `${publishedCount} 篇文章 / ${adminSummary?.tags || 0} 个标签`,
      body: "保持轻量、克制、可维护的内容系统和展示入口。",
      image: fallbackImages.article,
      icon: "analytics",
    },
  ];
  const socialLinks = [
    { id: "github", label: "GitHub", href: author?.github || "https://github.com", external: true },
    { id: "twitter", label: "Twitter", href: "https://x.com", external: true },
    { id: "email", label: "Email", href: `mailto:${email}`, external: false },
  ];
  const backgroundStyle = {
    "--card-page-start": siteConfig?.landingGradientStart || "#193554",
    "--card-page-end": siteConfig?.landingGradientEnd || "#1d1646",
    "--card-page-accent": siteConfig?.landingGlow || "rgba(122, 163, 255, 0.24)",
  };

  return (
    <section className="card-page" style={backgroundStyle}>
      <div className="card-page__grid">
        <div className="card-page__main">
          <div className="card-page__status">
            <span className="card-page__status-dot" />
            Currently Coding
          </div>

          <button
            type="button"
            className={`card-page__card-toggle ${flipped ? "is-flipped" : ""}`}
            aria-pressed={flipped}
            aria-label="翻转名片查看背面信息"
            onClick={() => setFlipped((current) => !current)}
          >
            <span className="card-page__card-hint">Tap To Flip</span>
            <span className="card-page__card-shell">
              <span className="card-page__card-face card-page__card-front">
                <span className="card-page__avatar-ring">
                  <img src={avatar} alt="外城头像" className="card-page__avatar" />
                </span>
                <span className="card-page__name-row">
                  <strong>外城</strong>
                  <em>Outer City</em>
                </span>
                <span className="card-page__intro">{intro}</span>
                <span className="card-page__summary">{summary}</span>
                <span className="card-page__chip-row">
                  <span>前端</span>
                  <span>写作</span>
                  <span>独立博客</span>
                </span>
              </span>

              <span className="card-page__card-face card-page__card-back">
                <span className="card-page__code-title">
                  <i />
                  <i />
                  <i />
                  outercity.config.ts
                </span>
                <code className="card-page__code-block">
                  <span>const outerCity = {"{"}</span>
                  <span>  route: &quot;#home&quot;,</span>
                  <span>  focus: [&quot;前端&quot;, &quot;长期写作&quot;, &quot;设计系统&quot;],</span>
                  <span>  published: {publishedCount},</span>
                  <span>  tags: {adminSummary?.tags || 0},</span>
                  <span>  contact: &quot;{email}&quot;,</span>
                  <span>  stack: [&quot;React&quot;, &quot;Vite&quot;, &quot;Node&quot;],</span>
                  <span>{"};"}</span>
                </code>
                <span className="card-page__code-note">点击名片正反切换，进入博客后继续浏览完整内容。</span>
              </span>
            </span>
          </button>

          <div className="card-page__actions">
            <button type="button" className="primary-button card-page__enter" onClick={() => setPage("home")}>
              <Icon>north_east</Icon>
              进入博客
            </button>
            <p>新首页采用独立落地页形式，博客内容仍保留原有结构与导航。</p>
          </div>

          <div className="card-page__socials" aria-label="社交链接">
            {socialLinks.map((item) => (
              <a
                key={item.id}
                className="card-page__social-link"
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                aria-label={item.label}
              >
                <SocialGlyph name={item.id} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="card-page__side">
          <section className="card-page__panel card-page__music">
            <div className="card-page__panel-head">
              <span>Music Deck</span>
              <button type="button" aria-label="音乐播放占位">
                <Icon>play_arrow</Icon>
              </button>
            </div>
            <div className="card-page__music-body">
              <img src={fallbackImages.article} alt="播放封面占位" />
              <div>
                <strong>Night Shift / Placeholder</strong>
                <p>音乐播放器区域先保留 UI，可在后端接入歌单或外链播放器。</p>
              </div>
            </div>
          </section>

          <section className="card-page__stack">
            {showcaseCards.map((item) => (
              <article key={item.title} className="card-page__mini-card">
                <div className="card-page__mini-copy">
                  <p>{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <span>{item.body}</span>
                  <small>
                    <Icon>{item.icon}</Icon>
                    外城小站
                  </small>
                </div>
                <img src={item.image} alt={item.title} />
              </article>
            ))}
          </section>
        </div>
      </div>
    </section>
  );
}
