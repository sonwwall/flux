import { navItems } from "../../../shared/constants";
import { Icon } from "../../../shared/ui/Icon";

export function SideNav({ page, setPage, setCategoryFilter, goAdmin }) {
  const navigate = (id) => {
    if (id === "blog") setCategoryFilter("");
    setPage(id);
  };

  return (
    <aside className="side-nav">
      <div className="side-kicker">
        <strong>导航</strong>
        <span>技术索引</span>
      </div>
      <nav aria-label="技术索引">
        {navItems.map(([id, label, icon], index) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
            <i className={`dot dot-${index}`} />
            <Icon>{icon}</Icon>
            {label}
          </button>
        ))}
      </nav>
      <div className="side-footer">
        <button onClick={goAdmin}>
          <Icon>admin_panel_settings</Icon>
          作者后台
        </button>
        <button onClick={() => setPage("missing")}>
          <Icon>history</Icon>
          归档
        </button>
      </div>
    </aside>
  );
}
