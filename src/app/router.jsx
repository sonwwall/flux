import { AdminPage } from "../pages/AdminPage";
import { ArticlePage } from "../pages/ArticlePage";
import { AuthorEditorPage } from "../pages/AuthorEditorPage";
import { AuthorPage } from "../pages/AuthorPage";
import { BlogPage } from "../pages/BlogPage";
import { EditorPage } from "../pages/EditorPage";
import { HomePage } from "../pages/HomePage";
import { MissingPage } from "../pages/MissingPage";
import { SiteConfigEditorPage } from "../pages/SiteConfigEditorPage";
import { TagsPage } from "../pages/TagsPage";
import { TourEditorPage } from "../pages/TourEditorPage";

export const routes = {
  home: HomePage,
  blog: BlogPage,
  tags: TagsPage,
  article: ArticlePage,
  author: AuthorPage,
  admin: AdminPage,
  editor: EditorPage,
  authorEditor: AuthorEditorPage,
  siteConfigEditor: SiteConfigEditorPage,
  tourEditor: TourEditorPage,
  missing: MissingPage,
};

export function RouterView({ page, routeProps }) {
  const common = {
    setPage: routeProps.setPage,
    setCategoryFilter: routeProps.setCategoryFilter,
  };

  const routeElements = {
    home: <HomePage posts={routeProps.posts} siteConfig={routeProps.siteConfig} onSelectPost={routeProps.setSelectedPost} setPage={routeProps.setPage} />,
    blog: <BlogPage posts={routeProps.posts} query={routeProps.query} categoryFilter={routeProps.categoryFilter} onSelectPost={routeProps.setSelectedPost} {...common} />,
    tags: <TagsPage tags={routeProps.tags} posts={routeProps.posts} tourConfig={routeProps.tourConfig} {...common} />,
    article: <ArticlePage post={routeProps.selectedPost || routeProps.posts[0]} author={routeProps.author} {...common} />,
    author: <AuthorPage author={routeProps.author} adminSummary={routeProps.adminSummary} goAdmin={routeProps.goAdmin} />,
    admin: (
      <AdminPage
        posts={routeProps.adminPosts}
        adminSummary={routeProps.adminSummary}
        onNewPost={routeProps.onNewPost}
        onEditPost={(post) => {
          routeProps.setEditorDraft(routeProps.toEditorDraft(post));
          routeProps.setPage("editor");
        }}
        onUpdatePostStatus={routeProps.onUpdatePostStatus}
        onDeletePost={routeProps.onDeletePost}
        onEditAuthor={() => routeProps.setPage("authorEditor")}
        onEditSite={() => routeProps.setPage("siteConfigEditor")}
        onEditTour={() => routeProps.setPage("tourEditor")}
      />
    ),
    editor: <EditorPage draft={routeProps.editorDraft} setDraft={routeProps.setEditorDraft} onSavePost={routeProps.onSavePost} setPage={routeProps.setPage} />,
    authorEditor: <AuthorEditorPage author={routeProps.author} onSave={routeProps.onSaveAuthor} setPage={routeProps.setPage} />,
    siteConfigEditor: <SiteConfigEditorPage siteConfig={routeProps.siteConfig} onSave={routeProps.onSaveSiteConfig} setPage={routeProps.setPage} />,
    tourEditor: <TourEditorPage tourConfig={routeProps.tourConfig} tags={routeProps.tags} posts={routeProps.posts} onSave={routeProps.onSaveTourPage} setPage={routeProps.setPage} />,
    missing: <MissingPage setPage={routeProps.setPage} />,
  };

  return routeElements[page] || routeElements.missing;
}
