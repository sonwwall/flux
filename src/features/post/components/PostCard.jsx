import { mediaURL } from "../../../shared/lib/format";
import { CardMeta } from "./CardMeta";
import { CategoryLabel } from "./CategoryLabel";

export function PostCard({ post, imagePos = "top", size = "normal", onClick }) {
  const image = mediaURL(post.image);
  const showImage = Boolean(image) && imagePos !== "none";
  const isHorizontal = imagePos === "left" || imagePos === "right";

  return (
    <article className={`post-card compact img-${imagePos} size-${size} ${isHorizontal ? "horizontal" : ""}`} onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined }}>
      {showImage && (
        <div className="post-media compact-media">
          <img src={image} alt="" />
        </div>
      )}
      <div className="post-card-body">
        <div>
          <CategoryLabel post={post} />
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
        <CardMeta post={post} />
      </div>
    </article>
  );
}
