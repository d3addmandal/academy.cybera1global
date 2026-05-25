import sanitizeHtmlLib from "sanitize-html";

const BLOCKED_CHARS = /[<>'"]/g;

export function sanitizeText(value: unknown, maxLen = 10000): string {
  if (typeof value !== "string") return "";
  return value.replace(BLOCKED_CHARS, "").trim().slice(0, maxLen);
}

// Use for rich-text HTML fields (blog content, page content, etc.)
export function sanitizeHtml(value: unknown, maxLen = 200_000): string {
  if (typeof value !== "string") return "";
  return sanitizeHtmlLib(value.slice(0, maxLen), {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "em", "u", "s", "sub", "sup",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["class"],
    },
    allowedSchemes: ["https", "http"],
    allowedSchemesByTag: { img: ["https", "http", "/"] },
    transformTags: {
      a: (tagName, attribs) => {
        const out: Record<string, string> = { ...attribs, rel: "noopener noreferrer" };
        if (attribs.target !== "_blank") delete out.target;
        return { tagName, attribs: out };
      },
    },
  });
}

export function sanitizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const s = value.trim().toLowerCase().slice(0, 254);
  return /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(s) ? s : "";
}

export function sanitizeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const s = value.trim().slice(0, 2048);
  try {
    const url = new URL(s);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    if (/^\/[a-zA-Z0-9\-._~/]*$/.test(s)) return s;
    return "";
  }
}

export function sanitizePhone(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^0-9+\-\s()]/g, "").trim().slice(0, 20);
}

export function sanitizeSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-z0-9\-]/g, "").trim().slice(0, 200);
}

export function sanitizeInt(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const n = parseInt(String(value), 10);
  if (isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}