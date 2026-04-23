export function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`.trim()}>{children}</span>;
}
