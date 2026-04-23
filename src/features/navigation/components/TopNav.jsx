import { Icon } from "../../../shared/ui/Icon";

export function TopNav({ page, setPage, query, setQuery, apiStatus, setCategoryFilter }) {
  const navigate = (id) => {
    if (id === "blog") setCategoryFilter("");
    setPage(id);
  };

  return (
    <header className="top-nav">
      <button className="brand" onClick={() => navigate("home")} aria-label="flux 首页">
        <span>flux</span>
        <strong>外城小站</strong>
      </button>
      <nav className="top-links" aria-label="主导航">
        {[
          ["blog", "博客"],
          ["tags", "标签云"],
          ["author", "作者"],
        ].map(([id, label]) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <label className="search-field">
          <Icon>search</Icon>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              setCategoryFilter("");
              setPage("blog");
            }}
            placeholder="搜索文章..."
          />
        </label>
        <span className={`api-status ${apiStatus}`}>
          {apiStatus === "online" ? "API 已连接" : apiStatus === "offline" ? "API 未连接" : "API 检测中"}
        </span>
      </div>
    </header>
  );
}
