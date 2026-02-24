"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import BlockEditor, { Block } from "./BlockEditor";

interface Props {
  articleId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialContent?: Block[];
  initialPublished?: boolean;
}

export default function ArticleForm({
  articleId,
  initialTitle = "",
  initialSlug = "",
  initialExcerpt = "",
  initialContent = [],
  initialPublished = false,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [blocks, setBlocks] = useState<Block[]>(initialContent);
  const [published, setPublished] = useState<boolean>(
    typeof initialPublished === "boolean" ? initialPublished : false
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const saveArticle = async (publish: boolean) => {
    setLoading(true);
    setError(null);
    setSaved(false);

    // Sanitize: remove empty blocks
    const sanitized = blocks.filter((block) => {
      if (block.type === "text") return block.content.trim() !== "";
      if (block.type === "image") return block.src.trim() !== "";
      return false;
    });

    const payload: any = {
      title,
      slug,
      excerpt,
      content_json: sanitized,
    };

    if (publish) {
      payload.published = true;
      payload.published_at = new Date().toISOString();
    }

    try {
      if (articleId) {
        const { error } = await supabase
          .from("articles")
          .update(payload)
          .eq("id", articleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("articles")
          .insert([
            {
              ...payload,
              published: publish,
              published_at: publish ? new Date().toISOString() : null,
            },
          ]);
        if (error) throw error;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        saveArticle(published);
      }}
    >
      {error && <div className="text-red-500 font-medium">{error}</div>}
      {saved && (
        <div className="text-green-600 font-medium">
          ✓ Article saved successfully
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Slug</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Excerpt</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Content</label>
        <BlockEditor blocks={blocks} setBlocks={setBlocks} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <label>Published</label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : articleId
          ? "Update Article"
          : "Create Article"}
      </button>
    </form>
  );
}
