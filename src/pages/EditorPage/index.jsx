import { useState } from "react";
import { uploadImage } from "../../features/post/api";
import { normalizePost, toEditorDraft } from "../../features/post/model";
import { categoryOptions } from "../../shared/constants";
import { estimateReadTime, mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

export function EditorPage({ draft, setDraft, onSavePost, setPage }) {
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
            <button type="button" onClick={() => save("draft")}>
              保存草稿
            </button>
            <button className="primary-button" type="button" onClick={() => save("published")}>
              发布文章
            </button>
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
