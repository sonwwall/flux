import { loadJSON, apiJSON } from "../../shared/lib/request";
import { authHeader } from "../auth/api";
import { normalizePost, normalizeTag } from "./model";

export async function fetchContentBundle() {
  const [postData, tagData, authorData, siteData, adminPostData, summaryData] = await Promise.all([
    loadJSON("/api/posts"),
    loadJSON("/api/tags"),
    loadJSON("/api/author"),
    loadJSON("/api/admin/site"),
    apiJSON("/api/admin/posts", { headers: authHeader() }),
    apiJSON("/api/admin/summary", { headers: authHeader() }),
  ]);

  return {
    posts: postData ? postData.map(normalizePost) : null,
    tags: tagData ? tagData.map(normalizeTag) : null,
    author: authorData,
    siteConfig: siteData && !siteData.error ? siteData : null,
    adminPosts: adminPostData && !adminPostData.error ? adminPostData.map(normalizePost) : null,
    adminSummary: summaryData && !summaryData.error ? summaryData : null,
    apiStatus: [postData, tagData, authorData].some(Boolean) ? "online" : "offline",
  };
}

export async function searchPosts(query) {
  const data = await loadJSON(`/api/posts?q=${encodeURIComponent(query)}`);
  return data ? data.map(normalizePost) : null;
}

export function savePost(draft) {
  const path = draft.id ? `/api/admin/posts/${draft.id}` : "/api/admin/posts";
  return apiJSON(path, {
    method: draft.id ? "PUT" : "POST",
    body: draft,
    headers: authHeader(),
  });
}

export function updatePostStatus(postId, status) {
  return apiJSON(`/api/admin/posts/${postId}/status`, {
    method: "PATCH",
    body: { status },
    headers: authHeader(),
  });
}

export function deletePost(postId) {
  return apiJSON(`/api/admin/posts/${postId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
}

export function saveAuthor(data) {
  return apiJSON("/api/author", {
    method: "PUT",
    body: data,
    headers: authHeader(),
  });
}

export function saveSiteConfig(data) {
  return apiJSON("/api/admin/site", {
    method: "PUT",
    body: data,
    headers: authHeader(),
  });
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/admin/uploads/images", {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 413) {
        return { error: "图片太大，请上传 20MB 以内的图片" };
      }
      return { error: data?.error || `upload failed: ${response.status}` };
    }

    return data;
  } catch {
    return { error: "network error" };
  }
}
