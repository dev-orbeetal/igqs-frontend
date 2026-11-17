"use client";

import { Extension } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => (attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {}),
          },
        },
      },
    ];
  },
});

function looksLikeHtml(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Plain paragraphs stay readable in the editor until someone formats them. */
export function toEditorHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function fromEditorHtml(html: string) {
  const text = html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (!text && !/<img\b/i.test(html)) return "";
  return html;
}

function ToolButton({
  editor,
  label,
  active,
  onClick,
  children,
}: {
  editor: Editor;
  label: string;
  active?: boolean;
  onClick: (editor: Editor) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={`inline-flex size-8 items-center justify-center rounded-md ${
        active ? "bg-igqs-green text-white dark:bg-igqs-gold dark:text-igqs-ink" : "hover:bg-igqs-gold/20"
      }`}
      onClick={() => onClick(editor)}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-igqs-gold/40" aria-hidden />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const icon = "size-4";
  return (
    <div className="flex flex-wrap items-center gap-x-0.5 gap-y-0.5 border-b border-igqs-gold/25 bg-igqs-sand/50 px-1.5 py-1 dark:bg-white/[0.04]">
      <div className="flex shrink-0 items-center">
        <ToolButton editor={editor} label="Bold" active={editor.isActive("bold")} onClick={(item) => item.chain().focus().toggleBold().run()}>
          <Bold className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Italic" active={editor.isActive("italic")} onClick={(item) => item.chain().focus().toggleItalic().run()}>
          <Italic className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Underline" active={editor.isActive("underline")} onClick={(item) => item.chain().focus().toggleUnderline().run()}>
          <Underline className={icon} aria-hidden />
        </ToolButton>
      </div>
      <ToolbarDivider />
      <div className="flex shrink-0 items-center">
        <ToolButton editor={editor} label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={(item) => item.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={(item) => item.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={(item) => item.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className={icon} aria-hidden />
        </ToolButton>
      </div>
      <ToolbarDivider />
      <div className="flex shrink-0 items-center">
        <ToolButton editor={editor} label="Bulleted list" active={editor.isActive("bulletList")} onClick={(item) => item.chain().focus().toggleBulletList().run()}>
          <List className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Numbered list" active={editor.isActive("orderedList")} onClick={(item) => item.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className={icon} aria-hidden />
        </ToolButton>
      </div>
      <ToolbarDivider />
      <div className="flex shrink-0 items-center">
        <ToolButton editor={editor} label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={(item) => item.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={(item) => item.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className={icon} aria-hidden />
        </ToolButton>
        <ToolButton editor={editor} label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={(item) => item.chain().focus().setTextAlign("right").run()}>
          <AlignRight className={icon} aria-hidden />
        </ToolButton>
      </div>
      <ToolbarDivider />
      <div className="flex shrink-0 items-center">
        <ToolButton
          editor={editor}
          label="Link"
          active={editor.isActive("link")}
          onClick={(item) => {
            const previous = item.getAttributes("link").href as string | undefined;
            const href = window.prompt("Link address", previous || "https://");
            if (href === null) return;
            if (!href.trim()) {
              item.chain().focus().unsetLink().run();
              return;
            }
            item.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
          }}
        >
          <LinkIcon className={icon} aria-hidden />
        </ToolButton>
        <ToolButton
          editor={editor}
          label="Image"
          onClick={(item) => {
            const src = window.prompt("Image address", "https://");
            if (!src?.trim()) return;
            const alt = window.prompt("Caption", "") || "";
            item.chain().focus().setImage({ src: src.trim(), alt }).run();
          }}
        >
          <ImageIcon className={icon} aria-hidden />
        </ToolButton>
      </div>
    </div>
  );
}

export function RichTextEditor({
  value,
  invalid,
  describedBy,
  onChange,
}: {
  value: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (next: string) => void;
}) {
  const applying = useRef(false);
  const lastSent = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write the paragraph…" }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class: "rich-editor-body",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
    },
    onUpdate: ({ editor: current }) => {
      if (applying.current) return;
      const next = fromEditorHtml(current.getHTML());
      lastSent.current = next;
      onChangeRef.current(next);
    },
  });

  useEffect(() => {
    if (!editor || value === lastSent.current) return;
    const next = toEditorHtml(value);
    applying.current = true;
    editor.commands.setContent(next, { emitUpdate: false });
    lastSent.current = value;
    applying.current = false;
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-36 rounded-b-xl bg-white dark:bg-[#10261e]" />;
  }

  return (
    <div className={`overflow-hidden rounded-xl border ${invalid ? "border-red-500" : "border-igqs-border-strong dark:border-igqs-gold/70"}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
