import { useState } from "react";
import { fallbackImages } from "../../data/fallback";
import { uploadImage } from "../../features/post/api";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

export function AuthorEditorPage({ author, onSave, setPage }) {
  const [draft, setDraft] = useState({ ...author });
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

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
    update("avatar", mediaURL(uploaded.path || uploaded.url));
    setMessage("头像已上传。");
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
          <div className="signal">
            <i />
            <span>作者后台</span>
          </div>
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
            <input value={draft.name || ""} onChange={(event) => update("name", event.target.value)} />
          </label>
          <label>
            身份 / 角色
            <input value={draft.role || ""} onChange={(event) => update("role", event.target.value)} />
          </label>
          <label>
            Handle
            <input value={draft.handle || ""} onChange={(event) => update("handle", event.target.value)} />
          </label>
          <label>
            简介
            <textarea rows="5" value={draft.bio || ""} onChange={(event) => update("bio", event.target.value)} />
          </label>
          <div className="editor-image-field">
            <span>头像</span>
            {draft.avatar ? (
              <img src={mediaURL(draft.avatar)} alt="头像预览" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div className="editor-image-empty">
                <Icon>person</Icon>
                暂无头像
              </div>
            )}
            <label className="upload-button">
              <Icon>{uploadingAvatar ? "hourglass_top" : "upload"}</Icon>
              {uploadingAvatar ? "上传中" : "上传头像"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploadingAvatar} onChange={(event) => handleAvatarUpload(event.target.files?.[0])} />
            </label>
            {draft.avatar && (
              <button type="button" className="image-clear" onClick={() => update("avatar", "")}>
                移除头像
              </button>
            )}
          </div>
          <label>
            GitHub URL
            <input value={draft.github || ""} onChange={(event) => update("github", event.target.value)} />
          </label>
          <label>
            联系方式
            <input value={draft.contact || ""} onChange={(event) => update("contact", event.target.value)} placeholder="邮箱、微信号等，点击联系时复制" />
          </label>
          <label>
            说明副标题
            <input value={draft.noteSubtitle || ""} onChange={(event) => update("noteSubtitle", event.target.value)} />
          </label>
          <div className="editor-image-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>作者说明</span>
              <button className="primary-button" type="button" onClick={() => update("notes", [...(draft.notes || []), { label: "", title: "", body: "" }])}>
                <Icon>add</Icon> 新增说明
              </button>
            </div>
            {(draft.notes || []).map((note, index) => (
              <div key={index} style={{ border: "1px solid var(--border, #333)", borderRadius: "var(--radius, 6px)", padding: "10px", marginTop: 8 }}>
                <label>
                  标签（如"原则"）
                  <input value={note.label || ""} onChange={(event) => updateNote(index, "label", event.target.value)} />
                </label>
                <label>
                  标题
                  <input value={note.title} onChange={(event) => updateNote(index, "title", event.target.value)} />
                </label>
                <label>
                  内容
                  <textarea rows="3" value={note.body} onChange={(event) => updateNote(index, "body", event.target.value)} />
                </label>
                <button className="primary-button" type="button" style={{ marginTop: 6 }} onClick={() => update("notes", draft.notes.filter((_, noteIndex) => noteIndex !== index))}>
                  <Icon>delete</Icon> 删除
                </button>
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
          <div className="author-card" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", padding: "1.5rem" }}>
            <img src={mediaURL(draft.avatar) || fallbackImages.author} alt="头像" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
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

  function updateNote(index, field, value) {
    const notes = (draft.notes || []).map((note, noteIndex) => (noteIndex === index ? { ...note, [field]: value } : note));
    update("notes", notes);
  }
}
