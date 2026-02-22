"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewArticle() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from("articles")
      .insert({
        title,
        slug,
        excerpt,
        content,
        published,
      });

    if (error) {
      console.error("Insert error:", error);
      alert("Error saving article: " + error.message);
      return;
    }

    alert("Article saved successfully");
    router.push("/admin");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-4">
      <h1 className="text-3xl font-bold">New Article</h1>

      <input
        placeholder="Title"
        className="w-full border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Slug (example: uber-vs-doordash-2026)"
        className="w-full border p-2"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <textarea
        placeholder="Excerpt"
        className="w-full border p-2"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />

      <textarea
        placeholder="Content (HTML allowed)"
        className="w-full border p-2 h-64"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publish
      </label>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Save Article
      </button>
    </div>
  );
}
