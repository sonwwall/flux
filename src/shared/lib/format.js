const apiOrigin = (import.meta.env.VITE_API_ORIGIN || "").replace(/\/$/, "");

export function mediaURL(value = "") {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("//")) {
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
  }
  return value;
}

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

export function estimateReadTime(content) {
  const length = [...(content || "").trim()].length;
  return `${Math.max(1, Math.ceil(length / 500))} 分钟阅读`;
}
