import { emptyEditorPost } from "../data/fallback";

const apiOrigin = (import.meta.env.VITE_API_ORIGIN || "").replace(/\/$/, "");

export const mediaURL = (value = "") => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  if (value.startsWith("/uploads/")) {
    return `${apiOrigin}${value}`;
  }
  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      if (url.pathname.startsWith("/uploads/") && ["127.0.0.1", "localhost"].includes(url.hostname)) {
        return `${apiOrigin}${url.pathname}`;
      }
    } catch {
      return value;
    }
    return value;
  }
  if (value.startsWith("//")) {
    return value;
  }
  return value;
};

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function normalizePost(post) {
  return {
    ...post,
    date: formatDate(post.published) || post.date || "",
    read: post.readTime || post.read || "5 分钟阅读",
    image: post.image || "",
  };
}

export function normalizeTag(tag) {
  return [tag.name, tag.description, String(tag.count), tag.icon, tag.color];
}

export function newEditorDraft() {
  return {
    ...emptyEditorPost,
    title: `新文章 ${new Date().toLocaleString("zh-CN")}`,
    excerpt: "这是一篇新的草稿摘要，用来说明文章的核心内容。",
    content: "# 新文章\n\n在这里使用 Markdown 编写正文。\n\n- 可以写列表\n- 可以写代码片段\n- 发布前正文至少需要二十个字符\n",
  };
}

export function toEditorDraft(post = {}) {
  return {
    id: post.id,
    title: post.title || "",
    slug: post.slug || "",
    category: post.category || "随笔",
    color: post.color || "primary",
    excerpt: post.excerpt || "",
    content: post.content || "",
    image: post.image || "",
    status: post.status || "draft",
  };
}

export function estimateReadTime(content) {
  const length = [...(content || "").trim()].length;
  return `${Math.max(1, Math.ceil(length / 500))} 分钟阅读`;
}
