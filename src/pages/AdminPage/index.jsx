import { useState } from "react";
import { ChangeSecretForm } from "../../features/auth/components/ChangeSecretForm";
import { Icon } from "../../shared/ui/Icon";

export function AdminPage({ posts, adminSummary, onNewPost, onEditPost, onUpdatePostStatus, onDeletePost, onEditAuthor, onEditSite }) {
  const [adminMessage, setAdminMessage] = useState("列表中的发布会执行内容校验；失败时请进入编辑器补齐标题、摘要和正文。");

  async function changeStatus(post) {
    const nextStatus = post.status === "draft" ? "published" : "draft";
    const result = await onUpdatePostStatus(post, nextStatus);
    if (result?.error) {
      setAdminMessage(`操作失败：${result.error}。请点击"编辑"进入 Markdown 编辑器完善内容。`);
      return;
    }
    setAdminMessage(nextStatus === "published" ? "文章已发布。" : "文章已撤回为草稿。");
  }

  async function removePost(post) {
    const result = await onDeletePost(post);
    if (result?.error) {
      setAdminMessage(`删除失败：${result.error}`);
      return;
    }
    setAdminMessage("文章已删除。");
  }

  return (
    <div className="content-wrap page-pad admin-page">
      <header className="page-hero">
        <div className="signal">
          <i />
          <span>作者后台</span>
        </div>
        <h1>内容管理台</h1>
        <p>面向作者的后台原型，用于管理文章、草稿、标签和发布状态。普通用户侧当前不提供登录入口。</p>
      </header>

      <section className="admin-metrics">
        {[
          ["文章总数", String(adminSummary.posts), "article"],
          ["草稿", String(adminSummary.drafts), "draft"],
          ["标签", String(adminSummary.tags), "sell"],
          ["本月更新", String(adminSummary.monthPosts), "calendar_month"],
        ].map(([label, value, icon]) => (
          <article key={label}>
            <Icon>{icon}</Icon>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-grid">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>文章管理</h2>
            <button className="primary-button" onClick={onNewPost}>
              新建文章
            </button>
          </div>
          <p className="admin-message">{adminMessage}</p>
          <div className="admin-table" style={{ maxHeight: 320, overflowY: "auto" }}>
            {posts.map((post) => (
              <div className="admin-row" key={post.slug || post.title}>
                <span>{post.title}</span>
                <em>{post.status === "draft" ? "草稿" : "已发布"}</em>
                <time>{post.date}</time>
                <div className="admin-row-actions">
                  <button onClick={() => onEditPost(post)}>编辑</button>
                  <button onClick={() => changeStatus(post)}>{post.status === "draft" ? "发布" : "撤回"}</button>
                  <button onClick={() => removePost(post)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>其他设置</h2>
          </div>
          <div className="admin-actions">
            <button onClick={onEditSite}>
              <Icon>home</Icon>
              编辑首页
            </button>
            <button onClick={onEditAuthor}>
              <Icon>manage_accounts</Icon>
              编辑作者页面
            </button>
          </div>
          <ChangeSecretForm />
        </article>
      </section>
    </div>
  );
}
