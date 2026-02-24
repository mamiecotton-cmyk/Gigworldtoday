"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { supabase } from "@/lib/supabaseClient";

type ArticleFormProps = {
  initialContent?: string;
  articleId: string;
};

export default function ArticleForm({
  initialContent = "",
  articleId,
}: ArticleFormProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Prevent Strict Mode double initialization
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const imageHandler = async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
          alert("Image must be under 2MB");
          return;
        }

        const fileName = `article-${Date.now()}.${file.name.split(".").pop()}`;

        const { error } = await supabase.storage
          .from("article-images")
          .upload(fileName, file);

        if (error) {
          alert(error.message);
          return;
        }

        const { data } = supabase.storage
          .from("article-images")
          .getPublicUrl(fileName);

        const range = quillRef.current?.getSelection(true);
        if (range) {
          quillRef.current?.insertEmbed(range.index, "image", data.publicUrl);
        }
      };
    };

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["link", "image"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
          handlers: {
            image: imageHandler,
          },
        },
      },
    });

    quill.root.innerHTML = initialContent;

    quillRef.current = quill;
  }, []);

  // Save handler
  async function handleSave() {
    if (!quillRef.current) return;
    const content = quillRef.current.root.innerHTML;
    const { error } = await supabase
      .from("articles")
      .update({ content })
      .eq("id", articleId);
    if (error) {
      alert("Failed to save article: " + error.message);
    } else {
      alert("Article saved!");
    }
  }



  return (
    <div className="bg-white border border-neutral-200 rounded-lg">
      <div ref={editorRef} />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}