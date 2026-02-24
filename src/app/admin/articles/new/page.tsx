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

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file: File, prefix: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleBodyImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file, "body");

      setContent(prev =>
        prev + `\n\n<img src="${imageUrl}" alt="Article image" />\n\n`
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!title || !slug) {
      alert("Title and slug required");
      return;
    }

    setLoading(true);

    let featuredImageUrl = null;

    try {
      if (featuredImage) {
        featuredImageUrl = await uploadImage(featuredImage, "featured");
      }

      const { error } = await supabase.from("articles").insert([
        {
          title,
          slug,
          excerpt,
          content,
          featured_image: featuredImageUrl,
          published,
          published_at: published ? new Date().toISOString() : null,
        },
      ]);

      if (error) throw error;

      router.push("/admin");
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Article</h1>

      <input
        type="text"
        placeholder="Title"
        className="w-full border p-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Slug"
        className="w-full border p-2 rounded"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <textarea
        placeholder="Excerpt"
        className="w-full border p-2 rounded"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />

      <textarea
        placeholder="Content (HTML allowed)"
        className="w-full border p-2 rounded h-40"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="space-y-2">
        <label className="font-semibold">Featured Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFeaturedImage(e.target.files?.[0] || null)
          }
        />
      </div>

      <div className="space-y-2">
        <label className="font-semibold">Insert Image Into Body</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleBodyImageUpload(file);
          }}
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publish immediately
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Saving..." : "Create Article"}
      </button>
    </div>
  );
}

