const DEFAULT_FORBID_TAGS = ["script", "style", "iframe", "object", "embed"];
const DEFAULT_FORBID_ATTR = ["onerror", "onload", "onclick", "onmouseover"];
const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;

function sanitizeNode(root, config) {
  const {
    FORBID_TAGS = DEFAULT_FORBID_TAGS,
    FORBID_ATTR = DEFAULT_FORBID_ATTR,
    ALLOW_UNKNOWN_PROTOCOLS = false,
  } = config || {};
  const blockedTags = new Set(FORBID_TAGS.map((value) => String(value).toLowerCase()));
  const blockedAttrs = new Set(FORBID_ATTR.map((value) => String(value).toLowerCase()));

  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const toRemove = [];

  while (walker.nextNode()) {
    const element = walker.currentNode;
    const tagName = element.tagName.toLowerCase();

    if (blockedTags.has(tagName)) {
      toRemove.push(element);
      continue;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (blockedAttrs.has(name) || name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (!ALLOW_UNKNOWN_PROTOCOLS && ["href", "src", "xlink:href"].includes(name)) {
        if (value && !SAFE_PROTOCOLS.test(value) && !value.startsWith("data:image/")) {
          element.removeAttribute(attribute.name);
        }
      }
    });
  }

  toRemove.forEach((element) => element.remove());
}

function stripFallback(html, config) {
  const blockedTags = (config?.FORBID_TAGS || DEFAULT_FORBID_TAGS).join("|");

  return String(html)
    .replace(new RegExp(`<\\/?(?:${blockedTags})\\b[^>]*>`, "gi"), "")
    .replace(/\son[a-z-]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, "");
}

const DOMPurify = {
  sanitize(dirty, config = {}) {
    const html = String(dirty ?? "");

    if (typeof document === "undefined") {
      return stripFallback(html, config);
    }

    const doc = document.implementation.createHTMLDocument("");
    const container = doc.createElement("div");
    container.innerHTML = html;
    sanitizeNode(container, config);
    return container.innerHTML;
  },
};

export default DOMPurify;
