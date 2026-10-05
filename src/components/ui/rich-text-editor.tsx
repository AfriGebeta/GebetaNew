"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, Strikethrough, Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Class applied to the scrollable content wrapper — use to control height */
  contentClassName?: string;
}

function Btn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "p-1.5 rounded transition-colors",
        active ? "bg-foreground/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-t border-border bg-muted/30 flex-wrap">
      <Btn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
        <UnderlineIcon className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <Strikethrough className="w-3.5 h-3.5" />
      </Btn>
      <div className="w-px h-4 bg-border mx-1" />
      <Btn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote className="w-3.5 h-3.5" />
      </Btn>
      <div className="w-px h-4 bg-border mx-1" />
      <Btn title="Link" onClick={setLink} active={editor.isActive("link")}>
        <LinkIcon className="w-3.5 h-3.5" />
      </Btn>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message...",
  contentClassName,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none prose prose-sm dark:prose-invert max-w-none min-h-full",
      },
    },
  });

  // Sync external content changes (e.g. template selection)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Scrollable content area — clicking anywhere focuses the editor */}
      <div
        className={cn("flex-1 overflow-y-auto cursor-text px-4 py-3", contentClassName)}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} className="h-full text-sm text-foreground" />
      </div>

      {/* Toolbar pinned at bottom */}
      <Toolbar editor={editor} />
    </div>
  );
}
