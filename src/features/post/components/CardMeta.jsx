export function CardMeta({ post }) {
  return (
    <div className="card-meta">
      <span>{post.read}</span>
      <span>{post.date}</span>
    </div>
  );
}
