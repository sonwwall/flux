import { useEffect, useMemo, useState } from "react";
import { fallbackPosts } from "../../data/fallback";
import { extractToc, renderMarkdown } from "../../shared/lib/markdown";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

export function ArticlePage({ post, author, setPage, setCategoryFilter }) {
  const article = post || fallbackPosts[0];
  const markdown = article.content || article.excerpt || "";
  const articleHTML = useMemo(() => renderMarkdown(markdown), [markdown]);
  const tocItems = useMemo(() => extractToc(markdown), [markdown]);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const quote = article.excerpt || "慢慢写，长期维护，让每篇文章都能被重新找到。";

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
              setCategoryFilter(article.category || "未分类");
              setPage("blog");
            }}
          >
            {article.category || "未分类"}
          </button>
          <Icon>chevron_right</Icon>
          <strong>{article.title}</strong>
        </nav>

        <header className="article-header">
          <h1>{article.title}</h1>
          <div className="byline">
            <span className="avatar">
              <Icon>person</Icon>
            </span>
            <strong>{author.name || "外城"}</strong>
            <span>{article.date}</span>
            <span>
              <Icon>schedule</Icon> {article.read}
            </span>
          </div>
        </header>

        {article.image && (
          <figure className="article-title-image">
            <img src={mediaURL(article.image)} alt={`${article.title} 标题图`} />
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
