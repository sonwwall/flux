import { useState } from "react";
import { fallbackImages } from "../../data/fallback";
import { uploadImage } from "../../features/post/api";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

export function SiteConfigEditorPage({ siteConfig, onSave, setPage }) {
  const [draft, setDraft] = useState({ ...siteConfig });
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleImageUpload(file) {
    if (!file) return;
    setUploadingImage(true);
    setMessage("正在上传图片...");
    const uploaded = await uploadImage(file);
    setUploadingImage(false);
    if (uploaded?.error) {
      setMessage(`上传失败：${uploaded.error}`);
      return;
    }
    update("heroImage", mediaURL(uploaded.path || uploaded.url));
    setMessage("图片已上传。");
  }

  async function handleSave() {
    const result = await onSave(draft);
    if (result?.error) {
      setMessage(`保存失败：${result.error}`);
      return;
    }
    setMessage("首页配置已保存。");
  }

  return (
    <div className="content-wrap page-pad editor-page">
      <header className="editor-hero">
        <div>
          <div className="signal">
            <i />
            <span>作者后台</span>
          </div>
          <h1>编辑首页</h1>
          <p>修改首页 Hero 区域的标题、描述和背景图片。</p>
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
            <input value={draft.heroTitle || ""} onChange={(event) => update("heroTitle", event.target.value)} />
          </label>
          <label>
            副标题（pill 标签）
            <input value={draft.heroSubtitle || ""} onChange={(event) => update("heroSubtitle", event.target.value)} />
          </label>
          <label>
            描述
            <textarea rows="4" value={draft.heroDesc || ""} onChange={(event) => update("heroDesc", event.target.value)} />
          </label>
          <div className="editor-image-field">
            <span>背景图片</span>
            {draft.heroImage ? (
              <img src={mediaURL(draft.heroImage)} alt="Hero 预览" style={{ width: "100%", borderRadius: "var(--radius)", objectFit: "cover", maxHeight: 120 }} />
            ) : (
              <div className="editor-image-empty">
                <Icon>image</Icon>
                暂无背景图
              </div>
            )}
            <label className="upload-button">
              <Icon>{uploadingImage ? "hourglass_top" : "upload"}</Icon>
              {uploadingImage ? "上传中" : "上传图片"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploadingImage} onChange={(event) => handleImageUpload(event.target.files?.[0])} />
            </label>
            {draft.heroImage && (
              <button type="button" className="image-clear" onClick={() => update("heroImage", "")}>
                移除图片
              </button>
            )}
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
          <div style={{ position: "relative", borderRadius: "var(--radius)", overflow: "hidden", minHeight: 160 }}>
            <img src={mediaURL(draft.heroImage) || fallbackImages.hero} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            <div className="hero-shade" />
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
              <span className="pill gradient" style={{ fontSize: "0.75rem" }}>
                {draft.heroSubtitle || "外城小站"}
              </span>
              <h3 style={{ margin: "8px 0 4px", color: "#fff" }}>{draft.heroTitle || "（标题）"}</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{draft.heroDesc || "（描述）"}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
