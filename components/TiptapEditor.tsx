'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useEffect } from 'react';

interface Props {
  content: string;
  setContent: (value: string) => void;
  contentClassName?: string;
}

export default function TiptapEditor({
  content,
  setContent,
  contentClassName,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (content !== editor.getHTML()) {
      // Pass false to prevent triggering onUpdate, which would cause an infinite loop
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Upload to server instead of embedding as base64 (which bloats DB and causes slow requests)
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error || "Зураг оруулахад алдаа гарлаа");
        return;
      }
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("Зураг оруулахад алдаа гарлаа");
    }
  };

  return (
    <div className="rounded-md p-3 bg-white h-full flex flex-col">
      <div className="flex flex-wrap gap-4 border-b pb-2 mb-3">
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </button>

        <select
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .setHeading({
                level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
              })
              .run()
          }
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
        </select>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ⬅
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ⬆
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ➡
        </button>

        <input
          type="color"
          className="w-10 h-8 border rounded"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        />

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          🟨 Highlight
        </button>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {'</>'}
        </button>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝ ❞
        </button>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => {
            const url = prompt('Image URL:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          🌐 Image URL
        </button>

        <label className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700 cursor-pointer">
          📁 Upload
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </label>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          ❌ Clear
        </button>

        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↩ Undo
        </button>
        <button
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition text-sm text-gray-700"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↪ Redo
        </button>
      </div>

      <div
        className={
          contentClassName ??
          '[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:text-gray-900 [&_.ProseMirror]:outline-none [&_.ProseMirror]:leading-relaxed'
        }
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

const btnClass = `
  px-2 py-1 border rounded hover:bg-gray-200 transition text-sm
`;
