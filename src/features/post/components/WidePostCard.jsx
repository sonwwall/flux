import { mediaURL } from "../../../shared/lib/format";
import { CardMeta } from "./CardMeta";
import { CategoryLabel } from "./CategoryLabel";

export function WidePostCard({ post, onClick }) {
  return (
    <article className={`post-card wide ${post.reverse ? "reverse" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="post-media">
        <img src={mediaURL(post.image)} alt="" />
      </div>
      <div className="post-body">
        <CategoryLabel post={post} />
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <CardMeta post={post} />
      </div>
    </article>
  );
}
