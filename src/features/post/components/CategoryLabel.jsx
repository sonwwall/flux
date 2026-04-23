export function CategoryLabel({ post }) {
  return (
    <div className="category-label">
      <i className={post.color} />
      <span className={post.color}>{post.category}</span>
    </div>
  );
}
