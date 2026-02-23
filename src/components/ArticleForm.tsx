"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Article = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string | null;
  published?: boolean;
};


export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();

  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [published, setPublished] = useState(article?.published || false);
  const [saving, setSaving] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(article?.featured_image || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFeaturedImageUpload = async () => {
    if (!featuredImageFile) return;

    const maxSize = 2 * 1024 * 1024;
    if (featuredImageFile.size > maxSize) {
      alert("Image must be under 2MB");
      return;
    }

    setUploadingImage(true);

    const fileExt = featuredImageFile.name.split(".").pop();
    const fileName = `featured-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(fileName, featuredImageFile);

    if (error) {
      alert("Upload failed");
      setUploadingImage(false);
      return;
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    setFeaturedImageUrl(data.publicUrl);
    setUploadingImage(false);
  };

  const handleSubmit = async () => {
    setSaving(true);

    if (article?.id) {
      await supabase
        .from("articles")
        .update({
          title,
          slug,
          excerpt,
          content,
          published,
          featured_image: featuredImageUrl,
        })
        .eq("id", article.id);
    } else {
      await supabase.from("articles").insert([
        {
          title,
          slug,
          excerpt,
          content,
          published,
          featured_image: featuredImageUrl,
        },
      ]);
    }

    setSaving(false);
    router.push("/admin");
  };

  return (
    <div className="space-y-6">

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 rounded"
      />

      <input
        type="text"
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full border p-3 rounded"
      />


      <textarea
        placeholder="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="w-full border p-3 rounded"
      />

      {/* Featured Image Upload UI */}
      <div className="border-t pt-6 mt-6">
        <label className="block text-sm font-medium mb-2">
          Featured Image
        </label>
        {featuredImageUrl && (
          <img
            src={featuredImageUrl}
            alt="Featured"
            className="mb-4 rounded-lg max-h-60"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFeaturedImageFile(e.target.files[0]);
            }
          }}
          className="mb-3"
        />
        <button
          type="button"
          onClick={handleFeaturedImageUpload}
          disabled={uploadingImage}
          className="bg-neutral-800 text-white px-4 py-2 rounded"
        >
          {uploadingImage ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      <textarea
        placeholder="Content (HTML supported)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-3 rounded h-64"
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
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {saving ? "Saving..." : article?.id ? "Update Article" : "Create Article"}
      </button>

    </div>
  );
}
