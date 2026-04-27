import { useMemo, useState } from "react";
import { Icon } from "../../shared/ui/Icon";

const colorOptions = ["primary", "secondary", "tertiary", "error", "primary-fixed"];

function toTagDrafts(tags = []) {
  return tags.map(([name, description, count, icon, color]) => ({
    name: name || "",
    description: description || "",
    count: Number(count) || 0,
    icon: icon || "sell",
    color: color || "primary",
  }));
}

export function TourEditorPage({ tourConfig, tags, posts, onSave, setPage }) {
  const [draft, setDraft] = useState({
    badge: tourConfig?.badge || "",
    title: tourConfig?.title || "",
    description: tourConfig?.description || "",
    tags: toTagDrafts(tags),
  });
  const [message, setMessage] = useState("");

  const categoryCounts = useMemo(
    () =>
      posts.reduce((counts, post) => {
        const category = post.category || "未分类";
        return { ...counts, [category]: (counts[category] || 0) + 1 };
      }, {}),
    [posts],
  );

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateTag(index, field, value) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.map((tag, tagIndex) => (tagIndex === index ? { ...tag, [field]: value } : tag)),
    }));
  }

  function moveTag(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.tags.length) return;
    setDraft((current) => {
      const nextTags = [...current.tags];
      [nextTags[index], nextTags[nextIndex]] = [nextTags[nextIndex], nextTags[index]];
      return { ...current, tags: nextTags };
    });
  }

  function addTag() {
    setDraft((current) => ({
      ...current,
      tags: [...current.tags, { name: "", description: "", count: 0, icon: "sell", color: "primary" }],
    }));
  }

  function removeTag(index) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.filter((_, tagIndex) => tagIndex !== index),
    }));
  }

  async function handleSave() {
    const result = await onSave(draft);
    if (result?.error) {
      setMessage(`保存失败：${result.error}`);
      return;
    }
    setMessage("导览页已保存。");
  }

  return (
    <div className="content-wrap page-pad editor-page">
      <header className="editor-hero">
        <div>
          <div className="signal">
            <i />
            <span>作者后台</span>
          </div>
          <h1>编辑导览页</h1>
          <p>修改导览页标题、说明和标签卡片内容，保存后立即生效。</p>
        </div>
        <button className="section-back" onClick={() => setPage("admin")}>
          <Icon>arrow_back</Icon>
          返回后台
        </button>
      </header>

      <section className="editor-layout">
        <aside className="editor-sidebar">
          <label>
            顶部标识
            <input value={draft.badge} onChange={(event) => update("badge", event.target.value)} />
          </label>
          <label>
            标题
            <input value={draft.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label>
            描述
            <textarea rows="4" value={draft.description} onChange={(event) => update("description", event.target.value)} />
          </label>

          <div className="editor-image-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>标签卡片</span>
              <button className="primary-button" type="button" onClick={addTag}>
                <Icon>add</Icon> 新增标签
              </button>
            </div>

            {draft.tags.map((tag, index) => (
              <div key={`${tag.name || "tag"}-${index}`} style={{ border: "1px solid var(--border, #333)", borderRadius: "var(--radius, 6px)", padding: "10px", marginTop: 8 }}>
                <label>
                  标签名
                  <input value={tag.name} onChange={(event) => updateTag(index, "name", event.target.value)} />
                </label>
                <label>
                  说明
                  <input value={tag.description} onChange={(event) => updateTag(index, "description", event.target.value)} />
                </label>
                <label>
                  图标
                  <input value={tag.icon} onChange={(event) => updateTag(index, "icon", event.target.value)} placeholder="如 code / sell / terminal" />
                </label>
                <label>
                  颜色
                  <select value={tag.color} onChange={(event) => updateTag(index, "color", event.target.value)}>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="editor-actions" style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => moveTag(index, -1)} disabled={index === 0}>
                    上移
                  </button>
                  <button type="button" onClick={() => moveTag(index, 1)} disabled={index === draft.tags.length - 1}>
                    下移
                  </button>
                  <button className="primary-button" type="button" onClick={() => removeTag(index)}>
                    <Icon>delete</Icon> 删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {message && <p className="editor-message">{message}</p>}
          <div className="editor-actions">
            <button type="button" onClick={() => setPage("admin")}>
              取消
            </button>
            <button className="primary-button" type="button" onClick={handleSave}>
              保存
            </button>
          </div>
        </aside>

        <article className="admin-panel" style={{ flex: 1 }}>
          <div className="admin-panel-head">
            <h2>预览</h2>
          </div>
          <header className="page-hero" style={{ paddingBottom: 24 }}>
            <div className="signal">
              <i />
              <span>{draft.badge || "标签云"}</span>
            </div>
            <h1>{draft.title || "内容索引"}</h1>
            <p>{draft.description || "通过标签快速进入不同主题。"}</p>
          </header>

          <section className="category-grid">
            {draft.tags.map((tag, index) => (
              <article className="category-card" key={`${tag.name || "preview"}-${index}`}>
                <Icon className="ghost-icon">{tag.icon || "sell"}</Icon>
                <i className={`glow ${tag.color || "primary"}`} />
                <h3>{tag.name || "（标签名）"}</h3>
                <p>{tag.description || "（标签说明）"}</p>
                <div>
                  <strong>{categoryCounts[tag.name] || tag.count || 0}</strong>
                  <span>篇文档</span>
                </div>
              </article>
            ))}
          </section>
        </article>
      </section>
    </div>
  );
}
