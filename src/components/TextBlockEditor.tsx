"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function TextBlockEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Handle drag & drop image upload
  useEffect(() => {
    if (!editor) return;

    const handleDrop = async (event: DragEvent) => {
      if (!event.dataTransfer?.files?.length) return;

      const file = event.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) return;

      event.preventDefault();

      const fileExt = file.name.split(".").pop();
      const fileName = `inline-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("article-images")
        .upload(fileName, file);

      if (error) {
        alert("Upload failed");
        return;
      }

      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(fileName);

      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    };

    const dom = editor.view.dom;
    dom.addEventListener("drop", handleDrop);

    return () => {
      dom.removeEventListener("drop", handleDrop);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded p-3">
      {/* Simple toolbar */}
      <div className="flex gap-2 mb-3 text-sm">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
