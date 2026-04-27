import { useEffect, useMemo, useRef, useState } from "react";
import { fallbackImages, fallbackSiteConfig } from "../../data/fallback";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

const defaultCodeBlockContent = fallbackSiteConfig.codeBlockContent;
const defaultCardTags = fallbackSiteConfig.cardTags;
const githubLanguageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  React: "#61dafb",
  JSX: "#61dafb",
  TSX: "#3178c6",
  Astro: "#ff5d01",
  Svelte: "#ff3e00",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Shell: "#89e051",
  Markdown: "#083fa1",
  MDX: "#1f6feb",
  "C++": "#f34b7d",
  C: "#555555",
  PHP: "#4f5d95",
  Ruby: "#701516",
};

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

function Toast({ open, children }) {
  return (
    <div className={`card-page__toast ${open ? "is-visible" : ""}`} role="status" aria-live="polite" aria-hidden={!open}>
      <Icon>mail</Icon>
      <span>{children}</span>
    </div>
  );
}

export function CardPage({ author, siteConfig, adminSummary, posts, setPage, onSelectPost }) {
  const [flipped, setFlipped] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [githubState, setGithubState] = useState({
    status: "idle",
    profile: null,
    repos: [],
    totalStars: 0,
  });
  const sectionRef = useRef(null);
  const audioRef = useRef(null);
  const toastTimeoutRef = useRef(0);
  const avatar = mediaURL(author?.avatar) || fallbackImages.author;
  const intro = siteConfig?.heroTitle || "在外城边缘，记录技术、阅读与日常。";
  const summary = author?.bio || "把前端工程、个人项目和阅读记录，沉淀成一个可长期维护的小站。";
  const displayName = author?.name || "外城";
  const displayHandle = author?.handle || "Outer City";
  const cardTags = useMemo(() => parseCardTags(siteConfig?.cardTags || defaultCardTags), [siteConfig?.cardTags]);
  const email = normalizeEmail(author?.contact || "hello@outercity.dev");
  const twitter = author?.twitter || "https://x.com";
  const musicPlaceholder = siteConfig?.musicPlaceholder || "音乐播放器区域先保留 UI，可在后端接入歌单或外链播放器。";
  const audioSrc = mediaURL(siteConfig?.audioSrc || "");
  const publishedCount = Math.max((adminSummary?.posts || posts?.length || 0) - (adminSummary?.drafts || 0), 0);
  const heroPost = posts?.[0] || {};
  const totalReadTime = useMemo(() => getTotalReadTime(posts), [posts]);
  const githubUsername = useMemo(() => extractGithubUsername(author?.github), [author?.github]);
  const githubProfileUrl = githubUsername ? `https://github.com/${githubUsername}` : "";
  const showcaseCards = useMemo(
    () => [
      {
        eyebrow: "Latest Entry",
        title: heroPost.title || "最近更新",
        body: heroPost.excerpt || "继续整理博客内容、页面结构和主题细节。",
        image: mediaURL(heroPost.image) || fallbackImages.circuit,
        icon: "deployed_code",
        post: heroPost,
      },
      {
        key: "site-stats",
        compact: true,
        content: (
          <StationStatsCard
            publishedCount={publishedCount}
            tagCount={adminSummary?.tags || 0}
            totalReadTime={totalReadTime}
            monthPosts={adminSummary?.monthPosts ?? 0}
          />
        ),
      },
      {
        key: "github-card",
        compact: true,
        content: (
          <GitHubInfoCard
            username={githubUsername}
            profile={githubState.profile}
            repos={githubState.repos}
            status={githubState.status}
            totalStars={githubState.totalStars}
            profileUrl={githubProfileUrl}
          />
        ),
      },
    ],
    [
      adminSummary?.monthPosts,
      adminSummary?.tags,
      githubProfileUrl,
      githubState.profile,
      githubState.repos,
      githubState.status,
      githubState.totalStars,
      githubUsername,
      heroPost,
      publishedCount,
      totalReadTime,
    ],
  );
  const codeLines = useMemo(() => formatCodeLines(siteConfig?.codeBlockContent || defaultCodeBlockContent), [siteConfig?.codeBlockContent]);
  const trackTitle = useMemo(() => getTrackTitle(audioSrc), [audioSrc]);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const socialLinks = [
    { id: "github", label: "GitHub", href: author?.github || "https://github.com", external: true },
    { id: "twitter", label: "Twitter", href: twitter, external: true },
  ];
  const backgroundStyle = {
    "--card-page-start": siteConfig?.landingGradientStart || "#193554",
    "--card-page-end": siteConfig?.landingGradientEnd || "#1d1646",
    "--card-page-accent": siteConfig?.landingGlow || "rgba(122, 163, 255, 0.24)",
    "--card-glow-x": "78%",
    "--card-glow-y": "14%",
    "--card-glow-offset-x": "0px",
    "--card-scroll-offset": "0px",
    "--card-orb-shift-x": "0px",
    "--card-orb-shift-y": "0px",
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const target = {
      x: window.innerWidth * 0.78,
      y: window.innerHeight * 0.14,
      scroll: window.scrollY || 0,
    };
    const current = { ...target };
    let rafId = 0;
    let scrollQueued = false;

    const update = () => {
      rafId = 0;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.scroll += (target.scroll - current.scroll) * 0.1;

      const xRatio = current.x / Math.max(window.innerWidth, 1);
      const yRatio = current.y / Math.max(window.innerHeight, 1);
      const centeredX = (xRatio - 0.5) * 42;
      const centeredY = (yRatio - 0.5) * 36;
      const scrollOffset = Math.min(current.scroll * 0.08, 38);

      section.style.setProperty("--card-glow-x", `${(xRatio * 100).toFixed(2)}%`);
      section.style.setProperty("--card-glow-y", `${(yRatio * 100).toFixed(2)}%`);
      section.style.setProperty("--card-glow-offset-x", `${centeredX.toFixed(2)}px`);
      section.style.setProperty("--card-scroll-offset", `${scrollOffset.toFixed(2)}px`);
      section.style.setProperty("--card-orb-shift-x", `${(centeredX * 0.55).toFixed(2)}px`);
      section.style.setProperty("--card-orb-shift-y", `${(centeredY + scrollOffset).toFixed(2)}px`);

      const needsMoreFrames =
        Math.abs(target.x - current.x) > 0.2 ||
        Math.abs(target.y - current.y) > 0.2 ||
        Math.abs(target.scroll - current.scroll) > 0.2;

      if (needsMoreFrames) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    const requestTick = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    const handleMouseMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      requestTick();
    };

    const handleScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(() => {
        scrollQueued = false;
        target.scroll = window.scrollY || 0;
        requestTick();
      });
    };

    const handleResize = () => {
      target.x = Math.min(target.x, window.innerWidth);
      target.y = Math.min(target.y, window.innerHeight);
      requestTick();
    };

    requestTick();
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const syncState = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
      setVolume(audio.volume);
      setIsPlaying(!audio.paused && !audio.ended);
    };

    syncState();
    audio.addEventListener("loadedmetadata", syncState);
    audio.addEventListener("timeupdate", syncState);
    audio.addEventListener("play", syncState);
    audio.addEventListener("pause", syncState);
    audio.addEventListener("ended", syncState);
    audio.addEventListener("volumechange", syncState);

    return () => {
      audio.removeEventListener("loadedmetadata", syncState);
      audio.removeEventListener("timeupdate", syncState);
      audio.removeEventListener("play", syncState);
      audio.removeEventListener("pause", syncState);
      audio.removeEventListener("ended", syncState);
      audio.removeEventListener("volumechange", syncState);
    };
  }, [audioSrc]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  useEffect(() => {
    if (!githubUsername) {
      setGithubState({
        status: "missing",
        profile: null,
        repos: [],
        totalStars: 0,
      });
      return undefined;
    }

    const controller = new AbortController();

    setGithubState({
      status: "loading",
      profile: null,
      repos: [],
      totalStars: 0,
    });

    Promise.all([
      fetch(`https://api.github.com/users/${githubUsername}`, { signal: controller.signal }),
      fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=4&type=all`, { signal: controller.signal }),
    ])
      .then(async ([profileResponse, reposResponse]) => {
        if (!profileResponse.ok || !reposResponse.ok) {
          throw new Error("GitHub fetch failed");
        }

        const [profile, reposPayload] = await Promise.all([profileResponse.json(), reposResponse.json()]);
        const repos = Array.isArray(reposPayload) ? reposPayload.slice(0, 4) : [];
        const totalStars = repos.reduce((sum, repo) => sum + (repo?.stargazers_count || 0), 0);

        setGithubState({
          status: "success",
          profile,
          repos,
          totalStars,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setGithubState({
          status: "error",
          profile: null,
          repos: [],
          totalStars: 0,
        });
      });

    return () => controller.abort();
  }, [githubUsername]);

  useEffect(() => () => window.clearTimeout(toastTimeoutRef.current), []);

  async function handleCopyEmail() {
    if (!email) return;
    let copied = false;

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch {
        copied = copyWithExecCommand(email);
      }
    } else {
      copied = copyWithExecCommand(email);
    }

    if (copied) {
      showCopyToast(setToastVisible, toastTimeoutRef);
      return;
    }

    setToastVisible(false);
    window.alert(`复制失败，请手动复制邮箱地址：${email}`);
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    audio.pause();
  }

  function handleSeek(event) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextTime = (Number(event.target.value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function handleVolumeChange(event) {
    const audio = audioRef.current;
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (audio) {
      audio.volume = nextVolume;
    }
  }

  return (
    <section ref={sectionRef} className="card-page" style={backgroundStyle}>
      <Toast open={toastVisible}>邮箱地址已复制 ✉️</Toast>

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
                  <img src={avatar} alt={`${displayName}头像`} className="card-page__avatar" />
                </span>
                <span className="card-page__name-row">
                  <strong>{displayName}</strong>
                  <em>{displayHandle}</em>
                </span>
                <span className="card-page__intro">{intro}</span>
                <span className="card-page__summary">{summary}</span>
                <span className="card-page__chip-row">
                  {cardTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
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
                  {codeLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="card-page__code-line">
                      {renderCodeLine(line)}
                    </span>
                  ))}
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
            <button type="button" className="card-page__social-link" aria-label="复制邮箱地址" onClick={handleCopyEmail}>
              <SocialGlyph name="email" />
              <span>Email</span>
            </button>
          </div>
        </div>

        <div className="card-page__side">
          <section className="card-page__panel card-page__music">
            <div className="card-page__panel-head">
              <span>Music Deck</span>
            </div>

            <audio ref={audioRef} src={audioSrc} preload="metadata" />

            {audioSrc ? (
              <div className="card-page__audio-player">
                <div className="card-page__audio-meta">
                  <img src={fallbackImages.article} alt={trackTitle} />
                  <div>
                    <strong>{trackTitle}</strong>
                    <p>{isPlaying ? "Now playing" : "Ready to play"}</p>
                  </div>
                  <button
                    type="button"
                    className="card-page__play-btn"
                    aria-label={isPlaying ? "暂停" : "播放"}
                    onClick={togglePlayback}
                    disabled={!audioSrc}
                  >
                    <Icon>{isPlaying ? "pause" : "play_arrow"}</Icon>
                  </button>
                </div>

                <div className="card-page__audio-controls">
                  <label className="card-page__audio-slider">
                    <span>{formatClock(currentTime)}</span>
                    <input type="range" min="0" max="100" step="0.1" value={progress} onChange={handleSeek} />
                    <span>{formatClock(duration)}</span>
                  </label>

                  <label className="card-page__audio-volume">
                    <Icon>{volume <= 0.01 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}</Icon>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="card-page__music-empty">
                <img src={fallbackImages.article} alt="音乐封面占位" />
                <div>
                  <strong>未设置歌曲</strong>
                  <p>{musicPlaceholder}</p>
                </div>
              </div>
            )}
          </section>

          <section className="card-page__stack">
            {showcaseCards.map((item) => (
              <article
                key={item.key || item.title}
                className={`card-page__mini-card${item.post ? " card-page__mini-card--clickable" : ""}${item.compact ? " card-page__mini-card--compact" : ""}`}
                onClick={() => {
                  if (item.post) {
                    onSelectPost?.(item.post);
                    setPage("article");
                  }
                }}
              >
                {item.content ? (
                  item.content
                ) : (
                  <>
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
                  </>
                )}
              </article>
            ))}
          </section>
        </div>
      </div>
    </section>
  );
}

function StationStatsCard({ publishedCount, tagCount, totalReadTime, monthPosts }) {
  const statRows = [
    {
      label: "文章总量",
      value: `📝 ${publishedCount} 篇文章`,
      progress: "60%",
    },
    {
      label: "标签归档",
      value: `🏷️ ${tagCount} 个标签`,
      progress: "40%",
    },
    {
      label: "阅读量",
      value: totalReadTime == null ? "⏱️ — 分钟阅读量" : `⏱️ ${totalReadTime} 分钟阅读量`,
      progress: "80%",
    },
  ];

  return (
    <div className="card-page__mini-body card-page__mini-body--stats">
      <div className="card-page__mini-copy">
        <p>Site Stats</p>
        <h3>站点统计</h3>
      </div>

      <div className="card-page__stats-list">
        {statRows.map((item) => (
          <div key={item.label} className="card-page__stats-row">
            <div className="card-page__stats-head">
              <span className="card-page__stats-label">{item.label}</span>
              <strong className="card-page__stats-value">{item.value}</strong>
            </div>
            <div className="card-page__stats-meter" style={{ "--card-progress": item.progress }}>
              <span />
            </div>
          </div>
        ))}
      </div>

      <small className="card-page__stats-footnote">本月更新 {monthPosts} 篇</small>
    </div>
  );
}

function GitHubInfoCard({ username, profile, repos, status, totalStars, profileUrl }) {
  const safeProfileUrl = profile?.html_url || profileUrl;
  const displayName = profile?.name || username || "GitHub";
  const displayHandle = username ? `@${username}` : "";

  return (
    <div className="card-page__mini-body card-page__mini-body--github">
      <div className="card-page__mini-copy">
        <p>GitHub</p>
      </div>

      {!username ? (
        <div className="card-page__github-empty">未配置 GitHub 账号</div>
      ) : status === "loading" ? (
        <div className="card-page__github-status">加载中...</div>
      ) : status === "error" ? (
        <div className="card-page__github-status">加载失败</div>
      ) : (
        <>
          <div className="card-page__github-profile">
            {profile?.avatar_url ? (
              <img className="card-page__github-avatar" src={profile.avatar_url} alt={username} />
            ) : null}
            <div className="card-page__github-info">
              <span className="card-page__github-name">{displayName}</span>
              <span className="card-page__github-handle">{displayHandle}</span>
            </div>
          </div>

          <div className="card-page__github-stats">
            <button type="button" className="card-page__github-stat" onClick={() => openExternal(`${safeProfileUrl}?tab=repositories`)}>
              <span>仓库</span>
              <strong>{profile?.public_repos ?? 0}</strong>
            </button>
            <button type="button" className="card-page__github-stat" onClick={() => openExternal(`${safeProfileUrl}?tab=repositories`)}>
              <span>星标</span>
              <strong>{totalStars}</strong>
            </button>
          </div>

          <div className="card-page__github-repos">
            {repos.length ? (
              repos.map((repo) => (
                <button key={repo.id || repo.name} type="button" className="card-page__github-repo" onClick={() => openExternal(repo.html_url)}>
                  <div className="card-page__github-repo-row">
                    <span className="card-page__github-repo-name">{repo.name}</span>
                    <span className="card-page__github-repo-stars">★ {repo.stargazers_count || 0}</span>
                  </div>
                  <div className="card-page__github-repo-row">
                    <span className="card-page__github-repo-lang">
                      <span className="card-page__github-lang-dot" style={{ background: getLanguageColor(repo.language) }} />
                      {repo.language || "Unknown"}
                    </span>
                    {repo.fork && <span className="card-page__github-repo-badge">fork</span>}
                  </div>
                </button>
              ))
            ) : (
              <div className="card-page__github-empty">暂无公开仓库</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatCodeLines(content) {
  const lines = (content || defaultCodeBlockContent).split(/\r?\n/).map((line) => line.trimEnd());

  while (lines.length && lines[0].trim().length === 0) {
    lines.shift();
  }

  while (lines.length && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  return lines;
}

function renderCodeLine(line) {
  const [, indent = "", content = ""] = line.match(/^(\s*)(.*)$/) || [];

  if (!content) {
    return <span className="card-page__code-indent"> </span>;
  }

  const constMatch = content.match(/^(const|let|var)\s+([A-Za-z0-9_$]+)(\s*=\s*)(.*)$/);
  if (constMatch) {
    const [, keyword, name, punctuation, value] = constMatch;
    return (
      <>
        <span className="card-page__code-indent">{indent}</span>
        <span className="card-page__code-keyword">{keyword}</span>
        <span className="card-page__code-punct"> </span>
        <span className="card-page__code-prop">{name}</span>
        <span className="card-page__code-punct">{punctuation}</span>
        <span className="card-page__code-value">{value}</span>
      </>
    );
  }

  const match = content.match(/^([A-Za-z0-9_$]+)\s*:\s*(.*?)(,?)$/);
  if (!match) {
    return (
      <>
        <span className="card-page__code-indent">{indent}</span>
        {content}
      </>
    );
  }

  const [, key, value, trailingComma] = match;
  return (
    <>
      <span className="card-page__code-indent">{indent}</span>
      <span className="card-page__code-prop">{key}</span>
      <span className="card-page__code-punct">: </span>
      <span className="card-page__code-value">{value}</span>
      {trailingComma ? <span className="card-page__code-punct">{trailingComma}</span> : null}
    </>
  );
}

function getTrackTitle(audioSrc) {
  if (!audioSrc) return "未设置歌曲";
  const filename = audioSrc.split("/").pop() || audioSrc;
  const cleanName = filename.replace(/\.[^.]+$/, "");
  try {
    return decodeURIComponent(cleanName);
  } catch {
    return cleanName;
  }
}

function formatClock(value) {
  if (!value || Number.isNaN(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getTotalReadTime(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return null;

  const total = posts.reduce((sum, post) => {
    const match = String(post?.readTime || "").match(/(\d+)/);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);

  return total > 0 ? total : null;
}

function extractGithubUsername(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(normalized)) {
    try {
      const url = new URL(normalized);
      if (!/github\.com$/i.test(url.hostname)) return "";
      const [username] = url.pathname.split("/").filter(Boolean);
      return username || "";
    } catch {
      return "";
    }
  }

  return normalized.replace(/^@/, "").split("/").filter(Boolean)[0] || "";
}

function getLanguageColor(language) {
  return githubLanguageColors[language] || "#8cacff";
}

function openExternal(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener");
}

function parseCardTags(value) {
  return String(value || defaultCardTags)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .replace(/^mailto:/i, "");
}

function copyWithExecCommand(value) {
  let textarea = null;
  try {
    textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.inset = "0 auto auto 0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    if (textarea?.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }
}

function showCopyToast(setToastVisible, toastTimeoutRef) {
  setToastVisible(true);
  window.clearTimeout(toastTimeoutRef.current);
  toastTimeoutRef.current = window.setTimeout(() => setToastVisible(false), 2500);
}
