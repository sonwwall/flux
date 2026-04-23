export function MissingPage({ setPage }) {
  return (
    <section className="missing">
      <span>404</span>
      <h1>未找到信号</h1>
      <p>请求的页面不在当前外城小站索引中。</p>
      <button className="primary-button" onClick={() => setPage("home")}>
        返回首页
      </button>
    </section>
  );
}
