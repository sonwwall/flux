import { useEffect, useState } from "react";
import { LoginDialog } from "../features/auth/components/LoginDialog";
import { useAuth } from "../features/auth/hooks";
import { SideNav } from "../features/navigation/components/SideNav";
import { TopNav } from "../features/navigation/components/TopNav";
import { deletePost as deletePostRequest, fetchContentBundle, saveAuthor as saveAuthorRequest, savePost, saveSiteConfig as saveSiteConfigRequest, updatePostStatus as updatePostStatusRequest } from "../features/post/api";
import { newEditorDraft, normalizePost, toEditorDraft } from "../features/post/model";
import { emptyEditorPost, fallbackAdminSummary, fallbackAuthor, fallbackPosts, fallbackSiteConfig, fallbackTags } from "../data/fallback";
import { useHashRoute } from "../shared/hooks/useHashRoute";
import { RouterView } from "./router";

const initialContent = { posts: fallbackPosts, adminPosts: fallbackPosts, tags: fallbackTags, author: fallbackAuthor, siteConfig: fallbackSiteConfig, adminSummary: fallbackAdminSummary };

export default function App() {
  const { page, setPage } = useHashRoute();
  const auth = useAuth();
  const [query, setQuery] = useState("");
  const [content, setContent] = useState(initialContent);
  const [apiStatus, setApiStatus] = useState("checking");
  const [editorDraft, setEditorDraft] = useState(emptyEditorPost);
  const [selectedPost, setSelectedPost] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const refreshData = async () => {
    const data = await fetchContentBundle();
    setContent((current) => ({ posts: data.posts || current.posts, adminPosts: data.adminPosts || current.adminPosts, tags: data.tags || current.tags, author: data.author || current.author, siteConfig: data.siteConfig || current.siteConfig, adminSummary: data.adminSummary || current.adminSummary }));
    setApiStatus(data.apiStatus);
  };

  useEffect(() => { refreshData(); }, []);

  const goAdmin = () => (auth.hasToken() ? setPage("admin") : setShowLogin(true));
  const refreshAfterWrite = async (result) => {
    if (result && !result.error) await refreshData(); return result;
  };
  const saveEditorPost = async (draft, status) => {
    const saved = await savePost({ ...draft, status });
    if (saved && !saved.error) {
      setEditorDraft(toEditorDraft(normalizePost(saved)));
      await refreshData();
    }
    return saved;
  };
  const updatePostStatus = async (post, status) => (post.id ? updatePostStatusRequest(post.id, status).then(refreshAfterWrite) : { error: "文章缺少 ID，无法操作" });
  const deletePost = async (post) => (post.id ? deletePostRequest(post.id).then(refreshAfterWrite) : { error: "文章缺少 ID，无法删除" });
  const saveAuthor = async (data) => saveAuthorRequest(data).then((saved) => {
    if (saved && !saved.error) setContent((current) => ({ ...current, author: saved })); return saved;
  });
  const saveSiteConfig = async (data) => saveSiteConfigRequest(data).then((saved) => {
    if (saved && !saved.error) setContent((current) => ({ ...current, siteConfig: saved })); return saved;
  });
  const onLogin = async (secret) => {
    const result = await auth.login(secret);
    if (!result?.error) {
      setShowLogin(false);
      await refreshData();
      setPage("admin");
    }
    return result;
  };

  const routeProps = { ...content, query, categoryFilter, editorDraft, selectedPost, setPage, setCategoryFilter, setEditorDraft, setSelectedPost, goAdmin, toEditorDraft, onSavePost: saveEditorPost, onUpdatePostStatus: updatePostStatus, onDeletePost: deletePost, onSaveAuthor: saveAuthor, onSaveSiteConfig: saveSiteConfig, onNewPost: () => { setEditorDraft(newEditorDraft()); setPage("editor"); } };

  return (
    <>
      <TopNav page={page} setPage={setPage} query={query} setQuery={setQuery} apiStatus={apiStatus} setCategoryFilter={setCategoryFilter} />
      <SideNav page={page} setPage={setPage} setCategoryFilter={setCategoryFilter} goAdmin={goAdmin} />
      <main className={`app-shell ${page === "article" ? "article-shell" : ""}`}>
        <RouterView page={page} routeProps={routeProps} />
      </main>
      {showLogin && <LoginDialog onLogin={onLogin} onClose={() => setShowLogin(false)} />}
    </>
  );
}
