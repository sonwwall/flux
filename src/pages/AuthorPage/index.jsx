import { useState } from "react";
import { fallbackImages } from "../../data/fallback";
import { CategoryLabel } from "../../features/post/components/CategoryLabel";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";
import { SectionHeader } from "../../features/navigation/components/SectionHeader";

export function AuthorPage({ author, adminSummary, goAdmin }) {
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
          <img src={mediaURL(author.avatar) || fallbackImages.author} alt="外城小站作者肖像" />
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

      <SectionHeader title="作者说明" eyebrow={author.noteSubtitle || ""} />
      <section className="result-list">
        {(author.notes || []).map((note, index) => (
          <article key={`${note.title}-${index}`}>
            <CategoryLabel post={{ category: note.label || "说明", color: index % 2 === 0 ? "primary" : "secondary" }} />
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
