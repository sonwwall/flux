import { useState } from "react";
import { clearToken, changeSecret } from "../api";

export function ChangeSecretForm() {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");

  async function handleChange() {
    if (!secret.trim()) return;
    const result = await changeSecret(secret);
    if (result?.error) {
      setMessage(`失败：${result.error}`);
      return;
    }
    clearToken();
    setSecret("");
    setMessage("密钥已更新，请重新登录。");
  }

  return (
    <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border, rgba(255,255,255,0.08))" }}>
      <div className="admin-panel-head" style={{ marginBottom: "0.75rem" }}>
        <h2>修改密钥</h2>
      </div>
      <label>
        新密钥
        <input type="text" style={{ WebkitTextSecurity: "disc" }} value={secret} onChange={(event) => setSecret(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleChange()} />
      </label>
      {message && <p className="admin-message" style={{ marginTop: "0.5rem" }}>{message}</p>}
      <div style={{ marginTop: "0.75rem" }}>
        <button className="primary-button" type="button" onClick={handleChange}>保存密钥</button>
      </div>
    </div>
  );
}
