"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import BlockEditor, { Block } from "@/components/BlockEditor";

interface Props {
  articleId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialContent?: Block[];
  initialPublished?: boolean;
  initialFeaturedImage?: string | null;
}

export default function ArticleForm({
  articleId,
  initialTitle = "",
  initialSlug = "",
  initialExcerpt = "",
  initialContent = [],
  initialPublished = false,
  initialFeaturedImage = null,
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

  // Featured image state
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(initialFeaturedImage);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  const uploadImage = async (file: File, prefix: string): Promise<string> => {
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

  const handleFeaturedUpload = async (file: File) => {
    setUploadingFeatured(true);
    try {
      const url = await uploadImage(file, "featured");
      setFeaturedImageUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload featured image");
    } finally {
      setUploadingFeatured(false);
    }
  };

  const removeFeaturedImage = () => {
    setFeaturedImageUrl(null);
  };

  const saveArticle = async (publish: boolean) => {
    setLoading(true);
    setError(null);
    setSaved(false);

    const sanitized = blocks.filter((block) => {
      if (block.type === "text") return block.content.trim() !== "";
      if (block.type === "image") return block.src.trim() !== "";
      return false;
    });

    const plainContent = sanitized
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.content.replace(/<[^>]*>/g, ""))
      .join("\n\n");

    const payload: any = {
      title,
      slug,
      excerpt,
      content: plainContent,
      content_json: sanitized,
      featured_image: featuredImageUrl,
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

      {/* Featured Image */}
      <div>
        <label className="block font-medium mb-1">Featured Image</label>
        {featuredImageUrl ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              <img
                src={featuredImageUrl}
                alt="Featured"
                className="max-h-48 rounded-lg border"
              />
              <button
                type="button"
                onClick={removeFeaturedImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md transition-colors"
                title="Remove featured image"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-md">{featuredImageUrl}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploadingFeatured
                  ? "border-gray-300 bg-gray-50"
                  : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/30"
              }`}
            >
              <div className="text-center">
                {uploadingFeatured ? (
                  <p className="text-sm text-gray-500">Uploading...</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">Click to upload featured image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingFeatured}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFeaturedUpload(file);
                }}
              />
            </label>
          </div>
        )}
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