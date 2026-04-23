import { marked } from "marked";
import DOMPurify from "dompurify";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const normalizeCodeLanguage = (lang = "") => {
  const language = String(lang).trim().split(/\s+/)[0].replace(/[^\w-]/g, "");
  return language || "text";
};

const plainTextFromTokens = (tokens = []) =>
  tokens.map((token) => token.text || plainTextFromTokens(token.tokens)).join("");

const slugBase = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";

let headingSlugCounts = new Map();

const resetHeadingSlugCounts = () => {
  headingSlugCounts = new Map();
};

const nextHeadingId = (text) => {
  const base = slugBase(text);
  const count = headingSlugCounts.get(base) || 0;
  headingSlugCounts.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
};

marked.use({
  renderer: {
    code({ text, lang, escaped }) {
      const language = normalizeCodeLanguage(lang);
      const code = escaped ? text : escapeHtml(text);
      return `<pre class="md-code-block" data-lang="${escapeHtml(language.toUpperCase())}"><code class="language-${escapeHtml(language)}">${code}</code></pre>`;
    },
    heading({ tokens, depth }) {
      const text = plainTextFromTokens(tokens);
      const id = nextHeadingId(text);
      return `<h${depth} id="${escapeHtml(id)}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
  },
});

export function renderMarkdown(markdown = "") {
  resetHeadingSlugCounts();
  const rawHtml = marked.parse(markdown);

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

export function extractToc(markdown = "") {
  resetHeadingSlugCounts();
  return marked
    .lexer(markdown)
    .filter((token) => token.type === "heading" && token.depth >= 1 && token.depth <= 3)
    .map((token) => {
      const text = plainTextFromTokens(token.tokens) || token.text;
      return {
        id: nextHeadingId(text),
        title: text,
        depth: token.depth,
      };
    });
}
