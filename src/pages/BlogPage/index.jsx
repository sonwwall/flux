import { CategoryLabel } from "../../features/post/components/CategoryLabel";
import { CardMeta } from "../../features/post/components/CardMeta";
import { usePostSearch } from "../../features/post/hooks";
import { mediaURL } from "../../shared/lib/format";
import { Icon } from "../../shared/ui/Icon";

export function BlogPage({ posts, query, categoryFilter, setCategoryFilter, setPage, onSelectPost }) {
  const results = usePostSearch(query, posts, categoryFilter);

  return (
    <div className="content-wrap page-pad">
      <header className="page-hero">
        <div className="signal">
          <i />
          <span>博客</span>
        </div>
        <h1>{categoryFilter ? `${categoryFilter}文章` : "文章归档"}</h1>
        <p>
          {categoryFilter
            ? `当前展示“${categoryFilter}”分类下的文章。你可以继续搜索标题、摘要或切换回全部文章。`
            : "按发布时间浏览外城小站的全部文章。当前阶段先提供阅读和检索，评论与普通用户登录暂不开放。"}
        </p>
        {categoryFilter && (
          <button className="filter-clear" type="button" onClick={() => setCategoryFilter("")}>
            <Icon>close</Icon>
            查看全部文章
          </button>
        )}
      </header>

      <section className="result-list blog-list">
        {results.length ? (
          results.map((post) => (
            <article
              key={post.title}
              onClick={() => {
                onSelectPost(post);
                setPage("article");
              }}
            >
              {post.image && (
                <div className="blog-card-image">
                  <img src={mediaURL(post.image)} alt="" />
                </div>
              )}
              <CategoryLabel post={post} />
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <CardMeta post={post} />
            </article>
          ))
        ) : (
          <article className="empty-result">
            <Icon>search_off</Icon>
            <h3>没有找到文章</h3>
            <p>当前分类或搜索条件下没有文章。可以清除筛选后再看全部内容。</p>
          </article>
        )}
      </section>
    </div>
  );
}
