const COLOR = /^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))$/;
const SIZE = /^(\d+(?:\.\d+)?)(px|rem|em|%)$/;
const BLOCKS = new Set(["p", "h1", "h2", "h3", "li", "blockquote", "td", "th", "div", "span"]);
const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
]);

export function isRichHtml(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function safeUrl(value: string) {
  const raw = value.trim();
  const lowered = raw.toLowerCase();
  if (
    (lowered.startsWith("https://") ||
      lowered.startsWith("http://") ||
      lowered.startsWith("mailto:") ||
      lowered.startsWith("tel:") ||
      lowered.startsWith("/")) &&
    !lowered.startsWith("//")
  ) {
    return raw;
  }
  return "";
}

function cleanStyle(value: string) {
  const kept: string[] = [];
  for (const chunk of value.split(";")) {
    const [propRaw, ...rest] = chunk.split(":");
    if (!propRaw || rest.length === 0) continue;
    const prop = propRaw.trim().toLowerCase();
    const raw = rest.join(":").trim();
    if (prop === "text-align" && ["left", "center", "right", "justify"].includes(raw.toLowerCase())) {
      kept.push(`text-align: ${raw.toLowerCase()}`);
    } else if ((prop === "color" || prop === "background-color") && COLOR.test(raw)) {
      kept.push(`${prop}: ${raw}`);
    } else if (prop === "font-size" && SIZE.test(raw)) {
      kept.push(`font-size: ${raw}`);
    }
  }
  return kept.join("; ");
}

/** Same allowlist as the API cleaner, so a stored article cannot run script. */
export function sanitizeRichHtml(value: string) {
  if (!isRichHtml(value) || typeof DOMParser === "undefined") return value;
  const doc = new DOMParser().parseFromString(`<div>${value}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const walk = (node: Element) => {
    for (const child of [...node.children]) {
      const tag = child.tagName.toLowerCase();
      if (!ALLOWED.has(tag)) {
        child.replaceWith(...child.childNodes);
        continue;
      }
      for (const attr of [...child.attributes]) {
        const name = attr.name.toLowerCase();
        if (name.startsWith("on") || name === "style" && !BLOCKS.has(tag)) {
          child.removeAttribute(attr.name);
          continue;
        }
        if (name === "href" || name === "src") {
          const url = safeUrl(attr.value);
          if (!url) child.removeAttribute(attr.name);
          else child.setAttribute(name, url);
        } else if (name === "style") {
          const style = cleanStyle(attr.value);
          if (style) child.setAttribute("style", style);
          else child.removeAttribute("style");
        } else if (!["alt", "title", "colspan", "rowspan", "href", "src"].includes(name)) {
          child.removeAttribute(attr.name);
        }
      }
      if (tag === "a") child.setAttribute("rel", "noopener noreferrer");
      walk(child);
    }
  };
  walk(root);
  return root.innerHTML;
}

/** Blank lines are paragraph breaks. A single line break stays inside the paragraph. */
export function plainParagraphs(value: string): string[] {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [normalized];
}

export function ReadingParagraphs({
  text,
  quote = false,
  className = "",
}: {
  text: string;
  quote?: boolean;
  className?: string;
}) {
  const paragraphs = plainParagraphs(text);
  return (
    <div className={`reading-prose ${quote ? "is-quote" : ""} ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function FormattedText({ text, className = "" }: { text?: string | null; className?: string }) {
  const source = (text ?? "").trim();
  if (!source) return null;
  if (isRichHtml(source)) {
    return (
      <div
        className={`rich-prose ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(source) }}
      />
    );
  }
  const paragraphs = plainParagraphs(source);
  const broken = paragraphs.length > 1 || paragraphs.some((paragraph) => paragraph.includes("\n"));
  if (!broken) {
    return <p className={className}>{paragraphs[0]}</p>;
  }
  return <ReadingParagraphs text={source} className={className} />;
}
