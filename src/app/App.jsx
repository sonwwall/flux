import { useCallback, useEffect, useState } from "react";
import { LoginDialog } from "../features/auth/components/LoginDialog";
import { useAuth } from "../features/auth/hooks";
import {
  fallbackAuthor,
  fallbackPosts,
  fallbackSiteConfig,
  fallbackTags,
  fallbackTourConfig,
} from "../data/fallback";
import {
  deletePost,
  fetchContentBundle,
  saveAuthor,
  savePost,
  saveSiteConfig,
  saveTourPage,
  updatePostStatus,
} from "../features/post/api";
import { SideNav } from "../features/navigation/components/SideNav";
import { TopNav } from "../features/navigation/components/TopNav";
import { newEditorDraft, normalizePost, toEditorDraft } from "../features/post/model";
import { useHashRoute } from "../shared/hooks/useHashRoute";
import { RouterView } from "./router";

const protectedPages = new Set(["admin", "editor", "authorEditor", "siteConfigEditor", "tourEditor"]);

function summarize(posts, tags) {
  const now = new Date();
  const monthPosts = posts.filter((post) => {
    const published = post.published ? new Date(post.published) : null;
    return published && published.getFullYear() === now.getFullYear() && published.getMonth() === now.getMonth();
  }).length;

  return {
    posts: posts.length,
    drafts: posts.filter((post) => post.status === "draft").length,
    tags: tags.length,
    monthPosts,
  };
}

function resolveBundle(bundle = {}) {
  const posts = bundle.posts || fallbackPosts;
  const tags = bundle.tags || fallbackTags;

  return {
    posts,
    tags,
    author: bundle.author || fallbackAuthor,
    siteConfig: bundle.siteConfig || fallbackSiteConfig,
    tourConfig: bundle.tourConfig || fallbackTourConfig,
    adminPosts: bundle.adminPosts || posts,
    adminSummary: bundle.adminSummary || summarize(bundle.adminPosts || posts, tags),
    apiStatus: bundle.apiStatus || "offline",
  };
}

export default function App() {
  const { page, setPage } = useHashRoute();
  const auth = useAuth();
  const hasToken = auth.isAuthenticated || auth.hasToken();
  const isImmersivePage = page === "card";
  const [content, setContent] = useState(() => resolveBundle());
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedPost, setSelectedPost] = useState(fallbackPosts[0] || null);
  const [editorDraft, setEditorDraft] = useState(() => newEditorDraft());
  const [showLogin, setShowLogin] = useState(false);

  const applyBundle = useCallback((bundle) => {
    const nextContent = resolveBundle(bundle);
    setContent(nextContent);
    setSelectedPost((current) => {
      if (!current) return nextContent.posts[0] || null;
      return (
        nextContent.posts.find((post) => (current.id && post.id === current.id) || (current.slug && post.slug === current.slug) || post.title === current.title) ||
        nextContent.posts[0] ||
        null
      );
    });
  }, []);

  const refreshBundle = useCallback(async () => {
    const bundle = await fetchContentBundle();
    applyBundle(bundle);
  }, [applyBundle]);

  useEffect(() => {
    refreshBundle();
  }, [refreshBundle]);

  useEffect(() => {
    if (protectedPages.has(page) && !hasToken) {
      setShowLogin(true);
      setPage("home");
    }
  }, [hasToken, page, setPage]);

  function goAdmin() {
    if (hasToken) {
      setPage("admin");
      return;
    }
    setShowLogin(true);
  }

  async function handleLogin(secret) {
    const result = await auth.login(secret);
    if (!result?.error) {
      setShowLogin(false);
      await refreshBundle();
      setPage("admin");
    }
    return result;
  }

  async function handleSavePost(draft) {
    const saved = await savePost(draft);
    if (!saved?.error) {
      setSelectedPost(normalizePost(saved));
      await refreshBundle();
    }
    return saved;
  }

  async function handleUpdatePostStatus(post, status) {
    const updated = await updatePostStatus(post.id, status);
    if (!updated?.error) {
      await refreshBundle();
    }
    return updated;
  }

  async function handleDeletePost(post) {
    const result = await deletePost(post.id);
    if (!result?.error) {
      await refreshBundle();
    }
    return result;
  }

  async function handleSaveAuthor(nextAuthor) {
    const saved = await saveAuthor(nextAuthor);
    if (!saved?.error) {
      setContent((current) => ({ ...current, author: saved }));
    }
    return saved;
  }

  async function handleSaveSiteConfig(nextConfig) {
    const saved = await saveSiteConfig(nextConfig);
    if (!saved?.error) {
      setContent((current) => ({ ...current, siteConfig: saved }));
    }
    return saved;
  }

  async function handleSaveTour(nextTourPage) {
    const saved = await saveTourPage(nextTourPage);
    if (!saved?.error) {
      setContent((current) => ({
        ...current,
        tourConfig: {
          badge: saved.badge,
          title: saved.title,
          description: saved.description,
        },
        tags: (saved.tags || []).map((tag) => [tag.name, tag.description, String(tag.count), tag.icon, tag.color]),
        adminSummary: {
          ...current.adminSummary,
          tags: (saved.tags || []).length,
        },
      }));
    }
    return saved;
  }

  return (
    <>
      {!isImmersivePage && (
        <TopNav page={page} setPage={setPage} query={query} setQuery={setQuery} apiStatus={content.apiStatus} setCategoryFilter={setCategoryFilter} />
      )}
      {!isImmersivePage && <SideNav page={page} setPage={setPage} setCategoryFilter={setCategoryFilter} goAdmin={goAdmin} />}

      <main className={`app-shell ${isImmersivePage ? "card-shell" : ""}`.trim()}>
        <RouterView
          page={page}
          routeProps={{
            ...content,
            query,
            categoryFilter,
            selectedPost,
            editorDraft,
            setPage,
            setCategoryFilter,
            setSelectedPost,
            setEditorDraft,
            toEditorDraft,
            goAdmin,
            onNewPost: () => {
              setEditorDraft(newEditorDraft());
              setPage("editor");
            },
            onSavePost: handleSavePost,
            onUpdatePostStatus: handleUpdatePostStatus,
            onDeletePost: handleDeletePost,
            onSaveAuthor: handleSaveAuthor,
            onSaveSiteConfig: handleSaveSiteConfig,
            onSaveTourPage: handleSaveTour,
          }}
        />
      </main>

      {showLogin && <LoginDialog onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </>
  );
}
