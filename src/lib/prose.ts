/** Split running text on Bangla danda and on . ! ? that end a sentence. */
export function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s*\n+\s*/g, " ").trim();
  if (!normalized) return [];
  const chars = Array.from(normalized);
  const sentences: string[] = [];
  let start = 0;
  for (let i = 0; i < chars.length; i++) {
    const current = chars[i];
    const previous = chars[i - 1] ?? "";
    const next = chars[i + 1] ?? "";
    let boundary = false;
    if (current === "।" || current === "！" || current === "？") boundary = true;
    else if (current === "!" || current === "?") boundary = next === "" || /\s/.test(next);
    else if (current === ".") {
      const decimal = /\d/.test(previous) && /\d/.test(next);
      boundary = !decimal && (next === "" || /\s/.test(next));
    }
    if (!boundary) continue;
    const sentence = chars.slice(start, i + 1).join("").trim();
    if (sentence) sentences.push(sentence);
    start = i + 1;
  }
  const tail = chars.slice(start).join("").trim();
  if (tail) sentences.push(tail);
  return sentences;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * Text that stays on the page, and the remainder that belongs behind বিস্তারিত.
 * A single long paragraph with no blank lines still collapses by sentence.
 */
export function previewParts(
  text: string,
  unit: "sentences" | "paragraphs",
  count: number,
): { visible: string; hidden: string } {
  const source = text.trim();
  const take = Math.max(1, count);
  if (!source) return { visible: "", hidden: "" };

  if (unit === "paragraphs") {
    const paragraphs = splitParagraphs(source);
    if (paragraphs.length > take) {
      return {
        visible: paragraphs.slice(0, take).join("\n\n"),
        hidden: paragraphs.slice(take).join("\n\n"),
      };
    }
    // Several short paragraphs are already the whole speech. Only a single
    // long block, with no blank lines, falls through to sentences.
    if (paragraphs.length > 1 || source.length <= 360) return { visible: source, hidden: "" };
  }

  const sentences = splitSentences(source);
  if (sentences.length <= take) return { visible: source, hidden: "" };
  return {
    visible: sentences.slice(0, take).join(" "),
    hidden: sentences.slice(take).join(" "),
  };
}

const EXAM = /পরীক্ষা|ভাইবা|মৌখিক|লিখিত|\bexam\b|\bviva\b|\boral\b|\bwritten\b/i;

function paperItems(sentence: string): string[] {
  const chunks = sentence
    .split(/[,،]/)
    .map((chunk) => chunk.trim().replace(/^(এবং|and)\s+/i, "").replace(/[।.]+$/u, "").trim())
    .filter(Boolean);
  if (chunks.length < 3) return [sentence.replace(/[।.]+$/u, "").trim()];
  return chunks;
}

/** Exam rules and required papers, when the paragraph actually contains both. */
export function groupAdmission(text: string): { exams: string[]; papers: string[] } | null {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return null;
  const exams: string[] = [];
  const papers: string[] = [];
  for (const sentence of sentences) {
    if (EXAM.test(sentence)) exams.push(sentence.replace(/[।.]+$/u, "").trim());
    else papers.push(...paperItems(sentence));
  }
  if (!exams.length || !papers.length) return null;
  return { exams, papers };
}

export function isNoteLabel(label: string): boolean {
  const clean = label.trim().replace(/[:：]\s*$/, "");
  return /^(note|notes|নোট|মন্তব্য)$/i.test(clean);
}
