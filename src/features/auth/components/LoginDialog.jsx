import { useState } from "react";

export function LoginDialog({ onLogin, onClose }) {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!secret.trim()) return;
    setLoading(true);
    const result = await onLogin(secret);
    setLoading(false);
    if (result?.error) {
      setMessage("密钥错误");
      return;
    }
    setMessage("");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "2rem", width: 320, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>进入作者后台</h2>
        <label>
          密钥
          <input
            type="text"
            style={{ WebkitTextSecurity: "disc" }}
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleLogin()}
            autoFocus
          />
        </label>
        {message && <p className="editor-message">{message}</p>}
        <div className="editor-actions">
          <button type="button" onClick={onClose}>取消</button>
          <button className="primary-button" type="button" onClick={handleLogin} disabled={loading}>
            {loading ? "验证中" : "进入"}
          </button>
        </div>
      </div>
    </div>
  );
}
