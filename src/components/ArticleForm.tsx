"use client";
import { useState, useRef } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
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
  const [showFeaturedOnList, setShowFeaturedOnList] = useState(true);
  const [showFeaturedOnDetail, setShowFeaturedOnDetail] = useState(true);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [croppingFeatured, setCroppingFeatured] = useState(false);
  const [featuredCrop, setFeaturedCrop] = useState<Crop>({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
  const featuredCropImgRef = useRef<HTMLImageElement>(null);

  const applyFeaturedCrop = async () => {
    const img = featuredCropImgRef.current;
    if (!img || !featuredCrop.width || !featuredCrop.height) return;
    setUploadingFeatured(true);
    try {
      const canvas = document.createElement("canvas");
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const c = featuredCrop;
      const pixelX = (c.unit === "%" ? (c.x / 100) * img.width : c.x) * scaleX;
      const pixelY = (c.unit === "%" ? (c.y / 100) * img.height : c.y) * scaleY;
      const pixelW = (c.unit === "%" ? (c.width / 100) * img.width : c.width) * scaleX;
      const pixelH = (c.unit === "%" ? (c.height / 100) * img.height : c.height) * scaleY;
      canvas.width = pixelW;
      canvas.height = pixelH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.92);
      });
      const file = new File([blob], `featured-cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = await uploadImage(file, "featured");
      setFeaturedImageUrl(url);
      setCroppingFeatured(false);
    } catch (err: any) {
      alert(err.message || "Failed to crop image");
    } finally {
      setUploadingFeatured(false);
    }
  };

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
      show_featured_on_list: showFeaturedOnList,
      show_featured_on_detail: showFeaturedOnDetail,
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
            {croppingFeatured ? (
              <div className="space-y-3">
                <div className="flex gap-2 mb-2">
                  <span className="text-xs text-gray-500 py-1">Preset:</span>
                  <button
                    type="button"
                    onClick={() => setFeaturedCrop({ unit: "%", x: 0, y: 10, width: 100, height: 56.25 })}
                    className="px-2 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100"
                  >
                    16:9 Blog Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeaturedCrop({ unit: "%", x: 0, y: 5, width: 100, height: 66.67 })}
                    className="px-2 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100"
                  >
                    3:2 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeaturedCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 })}
                    className="px-2 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100"
                  >
                    1:1 Square
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeaturedCrop({ unit: "%", x: 10, y: 10, width: 80, height: 80 })}
                    className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Free
                  </button>
                </div>
                <div className="border-2 border-teal-400 rounded-xl p-2 bg-gray-50">
                  <ReactCrop crop={featuredCrop} onChange={(c) => setFeaturedCrop(c)}>
                    <img
                      ref={featuredCropImgRef}
                      src={featuredImageUrl}
                      alt=""
                      className="max-w-full"
                      crossOrigin="anonymous"
                    />
                  </ReactCrop>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyFeaturedCrop}
                    disabled={uploadingFeatured}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50"
                  >
                    {uploadingFeatured ? "Cropping..." : "✓ Apply Crop"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCroppingFeatured(false)}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
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
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFeaturedCrop({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
                  setCroppingFeatured(true);
                }}
                className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                ✂ Crop
              </button>
              <label className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFeaturedUpload(file);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={removeFeaturedImage}
                className="px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
              >
                ✕ Remove
              </button>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-md">{featuredImageUrl}</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={showFeaturedOnList}
                  onChange={(e) => setShowFeaturedOnList(e.target.checked)}
                  className="rounded"
                />
                Show on blog listing
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={showFeaturedOnDetail}
                  onChange={(e) => setShowFeaturedOnDetail(e.target.checked)}
                  className="rounded"
                />
                Show on article page
              </label>
            </div>
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

      <div className="flex items-center gap-3">
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
        <button
          type="button"
          onClick={() => {
            if (!confirm("Discard all unsaved changes?")) return;
            setTitle(initialTitle);
            setSlug(initialSlug);
            setExcerpt(initialExcerpt);
            setBlocks(initialContent.length ? [...initialContent] : []);
            setFeaturedImageUrl(initialFeaturedImage);
            setShowFeaturedOnList(true);
            setShowFeaturedOnDetail(true);
            setPublished(typeof initialPublished === "boolean" ? initialPublished : false);
            setError(null);
            setSaved(false);
          }}
          className="px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}