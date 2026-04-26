import { useMemo } from "react";
import { Icon } from "../../shared/ui/Icon";

export function TagsPage({ tags, posts, tourConfig, setPage, setCategoryFilter }) {
  const categoryCounts = useMemo(
    () =>
      posts.reduce((counts, post) => {
        const category = post.category || "未分类";
        return { ...counts, [category]: (counts[category] || 0) + 1 };
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
          <span>{tourConfig?.badge || "标签云"}</span>
        </div>
        <h1>{tourConfig?.title || "内容索引"}</h1>
        <p>{tourConfig?.description || "通过标签快速进入不同主题。标签大小和文章数会随着后续内容增加继续扩展。"}</p>
      </header>

      <section className="category-grid">
        {tags.map(([name, subtitle, count, icon, color]) => (
          <button className="category-card" key={name} type="button" onClick={() => openCategory(name)}>
            <Icon className="ghost-icon">{icon}</Icon>
            <i className={`glow ${color}`} />
            <h3>{name}</h3>
            <p>{subtitle}</p>
            <div>
              <strong>{categoryCounts[name] || Number(count) || 0}</strong>
              <span>篇文档</span>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
