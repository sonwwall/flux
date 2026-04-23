import { fallbackImages } from "../../data/fallback";
import { Footer } from "../../features/navigation/components/Footer";
import { SectionHeader } from "../../features/navigation/components/SectionHeader";
import { PostCard } from "../../features/post/components/PostCard";
import { WidePostCard } from "../../features/post/components/WidePostCard";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

export function HomePage({ posts, siteConfig, setPage, onSelectPost }) {
  const heroImage = mediaURL(siteConfig?.heroImage) || fallbackImages.hero;

  return (
    <div className="content-wrap">
      <section className="hero">
        <img src={heroImage} alt="外城小站首页标题图" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <div className="meta-row">
            <span className="pill gradient">{siteConfig?.heroSubtitle || "外城小站"}</span>
          </div>
          <h1>{siteConfig?.heroTitle || "在外城边缘，记录技术、阅读与日常。"}</h1>
          <p>{siteConfig?.heroDesc || ""}</p>
          <button className="primary-button" onClick={() => setPage("blog")}>
            进入博客 <Icon>arrow_forward</Icon>
          </button>
        </div>
      </section>

      <SectionHeader title="最新文章" eyebrow="外城记录 / 最近更新" actions={["全部文章", "按时间"]} />

      <section className="post-grid">
        {posts.map((post, index) => {
          const navigate = () => {
            onSelectPost(post);
            setPage("article");
          };
          if (post.featured) return <WidePostCard key={post.title} post={post} onClick={navigate} />;

          const layouts = [
            { imagePos: "top", size: "large" },
            { imagePos: "top", size: "normal" },
            { imagePos: "top", size: "normal" },
            { imagePos: "left", size: "wide" },
            { imagePos: "none", size: "normal" },
            { imagePos: "none", size: "normal" },
          ];
          const { imagePos, size } = layouts[index % layouts.length];
          return (
            <PostCard
              key={post.title}
              post={post}
              imagePos={post.image ? imagePos : "none"}
              size={size}
              onClick={navigate}
            />
          );
        })}
      </section>

      <section className="newsletter">
        <div>
          <h2>每周信号</h2>
          <p>订阅外城小站的更新摘要，偶尔收到新文章、项目进展和一些值得保存的链接。</p>
        </div>
        <form>
          <input placeholder="terminal@flux.dev" type="email" />
          <button className="primary-button" type="button">
            立即订阅
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
