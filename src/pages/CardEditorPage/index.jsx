import { useState } from "react";
import { fallbackSiteConfig } from "../../data/fallback";
import { uploadAudio } from "../../features/post/api";
import { Icon } from "../../shared/ui/Icon";

const defaultLandingColors = {
  landingGradientStart: "#193554",
  landingGradientEnd: "#1d1646",
  landingGlow: "#7aa3ff",
};

const defaultMusicPlaceholder = "音乐播放器区域先保留 UI，可在后端接入歌单或外链播放器。";
const defaultCodeBlockContent = fallbackSiteConfig.codeBlockContent;

export function CardEditorPage({ siteConfig, author, onSave, setPage }) {
  const [draftSiteConfig, setDraftSiteConfig] = useState(() => ({
    ...(siteConfig || {}),
    heroTitle: siteConfig?.heroTitle || "",
    landingGradientStart: siteConfig?.landingGradientStart || defaultLandingColors.landingGradientStart,
    landingGradientEnd: siteConfig?.landingGradientEnd || defaultLandingColors.landingGradientEnd,
    landingGlow: toColorValue(siteConfig?.landingGlow, defaultLandingColors.landingGlow),
    musicPlaceholder: siteConfig?.musicPlaceholder || defaultMusicPlaceholder,
    audioSrc: siteConfig?.audioSrc || "",
    codeBlockContent: siteConfig?.codeBlockContent || defaultCodeBlockContent,
  }));
  const [draftAuthor, setDraftAuthor] = useState(() => ({
    ...(author || {}),
    bio: author?.bio || "",
    github: author?.github || "https://github.com",
    twitter: author?.twitter || "https://x.com",
    contact: author?.contact || "hello@outercity.dev",
  }));
  const [message, setMessage] = useState("");
  const [uploadingAudio, setUploadingAudio] = useState(false);

  function updateSite(field, value) {
    setDraftSiteConfig((current) => ({ ...current, [field]: value }));
  }

  function updateAuthor(field, value) {
    setDraftAuthor((current) => ({ ...current, [field]: value }));
  }

  async function handleAudioUpload(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    setUploadingAudio(true);
    setMessage("正在上传音频...");
    const result = await uploadAudio(file);
    setUploadingAudio(false);
    event.target.value = "";

    if (result?.error) {
      setMessage(`音频上传失败：${result.error}`);
      return;
    }

    updateSite("audioSrc", result.path || result.url || "");
    setMessage("音频上传成功，保存后会同步到落地页。");
  }

  async function handleSave() {
    const result = await onSave({
      siteConfig: {
        ...(siteConfig || {}),
        ...draftSiteConfig,
        landingGlow: toRgbaColor(draftSiteConfig.landingGlow),
        codeBlockContent: normalizeCodeBlockContent(draftSiteConfig.codeBlockContent),
      },
      author: {
        ...(author || {}),
        ...draftAuthor,
      },
    });

    if (result?.error) {
      setMessage(`保存失败：${result.error}`);
      return;
    }

    setMessage("导览页配置已保存。");
  }

  const previewStyle = {
    background: `radial-gradient(circle at top right, ${toRgbaColor(draftSiteConfig.landingGlow)} 0%, rgba(0, 0, 0, 0) 42%), linear-gradient(160deg, ${draftSiteConfig.landingGradientStart}, ${draftSiteConfig.landingGradientEnd})`,
    borderRadius: "var(--radius)",
    padding: "28px",
    minHeight: 420,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
  };

  const socialPreview = [
    ["GitHub", draftAuthor.github],
    ["Twitter", draftAuthor.twitter],
    ["Email", draftAuthor.contact],
  ];

  const codePreview = normalizeCodeBlockContent(draftSiteConfig.codeBlockContent || defaultCodeBlockContent)
    .split(/\r?\n/)
    .filter(Boolean);

  return (
    <div className="content-wrap page-pad editor-page">
      <header className="editor-hero">
        <div>
          <div className="signal">
            <i />
            <span>作者后台</span>
          </div>
          <h1>编辑导览页</h1>
          <p>集中调整导览页的背景、名片文案、代码框、社交链接和音乐播放器配置，保存后会同步到落地页。</p>
        </div>
        <button className="section-back" onClick={() => setPage("admin")}>
          <Icon>arrow_back</Icon>
          返回后台
        </button>
      </header>

      <section className="editor-layout">
        <aside className="editor-sidebar">
          <section className="card-editor-group">
            <h2>视觉设置</h2>
            <div className="card-editor-color-grid">
              <label className="card-editor-color-field">
                起始色
                <input type="color" value={draftSiteConfig.landingGradientStart} onChange={(event) => updateSite("landingGradientStart", event.target.value)} />
              </label>
              <label className="card-editor-color-field">
                结束色
                <input type="color" value={draftSiteConfig.landingGradientEnd} onChange={(event) => updateSite("landingGradientEnd", event.target.value)} />
              </label>
              <label className="card-editor-color-field">
                发光色
                <input type="color" value={draftSiteConfig.landingGlow} onChange={(event) => updateSite("landingGlow", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="card-editor-group">
            <h2>名片内容</h2>
            <label>
              标题文字
              <input value={draftSiteConfig.heroTitle || ""} onChange={(event) => updateSite("heroTitle", event.target.value)} />
            </label>
            <label>
              简介文字
              <textarea rows="4" value={draftAuthor.bio || ""} onChange={(event) => updateAuthor("bio", event.target.value)} />
            </label>
          </section>

          <section className="card-editor-group">
            <h2>代码框内容</h2>
            <label>
              每行一个键值对
              <textarea
                rows="8"
                className="card-editor-code-input"
                placeholder='focus: ["前端", "长期写作"]'
                value={draftSiteConfig.codeBlockContent || ""}
                onChange={(event) => updateSite("codeBlockContent", event.target.value)}
              />
            </label>
          </section>

          <section className="card-editor-group">
            <h2>社交链接</h2>
            <label>
              GitHub 链接
              <input value={draftAuthor.github || ""} onChange={(event) => updateAuthor("github", event.target.value)} />
            </label>
            <label>
              Twitter 链接
              <input value={draftAuthor.twitter || ""} onChange={(event) => updateAuthor("twitter", event.target.value)} />
            </label>
            <label>
              Email 地址
              <input value={draftAuthor.contact || ""} onChange={(event) => updateAuthor("contact", event.target.value)} />
            </label>
          </section>

          <section className="card-editor-group">
            <h2>音乐管理</h2>
            <label>
              当前歌曲 URL / 路径
              <input value={draftSiteConfig.audioSrc || ""} onChange={(event) => updateSite("audioSrc", event.target.value)} placeholder="/uploads/audio/example.mp3" />
            </label>
            <label className="card-editor-upload-field">
              上传歌曲
              <input type="file" accept=".mp3,.ogg,.wav,audio/mpeg,audio/ogg,audio/wav" onChange={handleAudioUpload} disabled={uploadingAudio} />
            </label>
            <label>
              空状态说明
              <textarea rows="4" value={draftSiteConfig.musicPlaceholder || ""} onChange={(event) => updateSite("musicPlaceholder", event.target.value)} />
            </label>
          </section>

          {message && <p className="editor-message">{message}</p>}
          <div className="editor-actions">
            <button type="button" onClick={() => setPage("admin")}>
              取消 / 返回后台
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

          <div style={previewStyle}>
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.72)", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "#7df1d0", boxShadow: `0 0 14px ${toRgbaColor(draftSiteConfig.landingGlow)}` }} />
                Currently Coding
              </div>

              <div style={{ padding: "24px", borderRadius: 22, background: "rgba(7, 12, 22, 0.72)", backdropFilter: "blur(16px)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
                <strong style={{ display: "block", marginBottom: 14, fontSize: "1.3rem" }}>外城</strong>
                <h3 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.2 }}>{draftSiteConfig.heroTitle || "（标题）"}</h3>
                <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,0.74)", lineHeight: 1.8 }}>{draftAuthor.bio || "（简介）"}</p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {socialPreview.map(([label, value]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 14px", borderRadius: 14, background: "rgba(7, 12, 22, 0.54)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "rgba(255,255,255,0.64)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                    <strong style={{ fontSize: "0.9rem", color: "#fff" }}>{value || "未填写"}</strong>
                  </div>
                ))}
              </div>

              <div style={{ padding: "18px", borderRadius: 18, background: "rgba(7, 12, 22, 0.62)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.64)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>outercity.config.ts</span>
                  <span style={{ color: "rgba(255,255,255,0.56)", fontSize: "0.74rem" }}>{codePreview.length} lines</span>
                </div>
                <pre className="card-editor-code-preview">
                  <span>const outerCity = {"{"}</span>
                  {codePreview.map((line, index) => (
                    <span key={`${line}-${index}`}>  {line}</span>
                  ))}
                  <span>{"};"}</span>
                </pre>
              </div>

              <div style={{ padding: "18px", borderRadius: 18, background: "rgba(7, 12, 22, 0.62)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.64)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Music Deck</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#fff" }}>
                    queue_music
                  </span>
                </div>
                <p style={{ margin: "0 0 10px", color: "#fff", fontWeight: 700 }}>{draftSiteConfig.audioSrc || "未设置歌曲路径"}</p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.74)", lineHeight: 1.8 }}>{draftSiteConfig.musicPlaceholder || defaultMusicPlaceholder}</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function normalizeCodeBlockContent(value) {
  return (value || defaultCodeBlockContent)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

function toColorValue(value, fallback) {
  if (!value) return fallback;
  if (value.startsWith("#")) return value;
  const rgbaMatch = value.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!rgbaMatch) return fallback;
  const [, r, g, b] = rgbaMatch;
  return `#${Number(r).toString(16).padStart(2, "0")}${Number(g).toString(16).padStart(2, "0")}${Number(b).toString(16).padStart(2, "0")}`;
}

function toRgbaColor(value) {
  if (!value) return "rgba(122, 163, 255, 0.24)";
  if (value.startsWith("rgba")) return value;
  if (value.startsWith("rgb")) return value.replace("rgb(", "rgba(").replace(")", ", 0.24)");
  if (!value.startsWith("#")) return "rgba(122, 163, 255, 0.24)";
  const normalized = value.slice(1);
  const expanded = normalized.length === 3 ? normalized.split("").map((item) => `${item}${item}`).join("") : normalized;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.24)`;
}
