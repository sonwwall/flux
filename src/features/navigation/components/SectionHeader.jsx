export function SectionHeader({ title, eyebrow, actions = [] }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        <p>{eyebrow}</p>
      </div>
      {actions.length > 0 && (
        <div className="section-actions">
          {actions.map((action) => (
            <button key={action}>{action}</button>
          ))}
        </div>
      )}
    </div>
  );
}
