"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/components/QuillEditor"), { ssr: false });

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  price: string;
  image: string;
  images?: string[];
  featured: boolean;
  external_link: string;
  sort_order?: number;
  published?: boolean;
};

type ProductForm = Omit<ProductRow, "id"> & { imagesText?: string };

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  short_description: "",
  long_description: "",
  price: "",
  image: "/city-background.jpg",
  images: [],
  imagesText: "",
  featured: false,
  external_link: "",
  published: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from("article-images")
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(fileName);
      const url = data.publicUrl;
      setForm((prev) => ({
        ...prev,
        image: url,
        imagesText: url + (prev.imagesText ? "\n" + prev.imagesText : ""),
      }));
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)),
    [products]
  );

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (!res.ok) {
        alert(json?.error || "Failed to load products");
        return;
      }
      setProducts((json.data ?? []) as ProductRow[]);
    } catch (err: any) {
      alert(err.message || "Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const onSave = async () => {
    if (
      !form.name ||
      !form.slug ||
      !form.short_description ||
      !form.long_description ||
      !form.price ||
      !form.external_link
    ) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const images = (
      form.imagesText
        ? form.imagesText
        : (form.images || []).join("\n")
    )
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      slug: form.slug,
      short_description: form.short_description,
      long_description: form.long_description,
      price: form.price,
      image: images[0] ?? form.image ?? "/city-background.jpg",
      images,
      featured: form.featured,
      external_link: form.external_link,
      published: form.published,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...payload } : payload;

      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        alert(json?.error || `Failed to ${editingId ? "update" : "create"} product`);
        return;
      }
      await fetchProducts();
      resetForm();
    } catch (err: any) {
      setLoading(false);
      alert(err.message || "Failed to save product");
    }
  };

  const onEdit = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description,
      long_description: product.long_description,
      price: product.price,
      image: product.image,
      images: product.images || [],
      imagesText: (product.images || []).join("\n"),
      featured: product.featured,
      external_link: product.external_link,
      published: product.published ?? true,
    });
  };

  const onDelete = async (id: string) => {
    const confirmText = prompt("Type DELETE to remove this product:");
    if (confirmText !== "DELETE") return;

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json?.error || "Failed to delete product");
        return;
      }
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  /* ======= DRAG AND DROP ======= */
  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = async (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const reordered = [...sortedProducts];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    // Update sort_order locally
    const updated = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setProducts(updated);
    setDragIdx(null);
    setDragOverIdx(null);

    // Save to database
    setSavingOrder(true);
    try {
      const updates = updated.map((p) => ({
        id: p.id,
        sort_order: p.sort_order,
      }));

      for (const u of updates) {
        await supabase
          .from("products")
          .update({ sort_order: u.sort_order })
          .eq("id", u.id);
      }
    } catch (err) {
      console.error("Failed to save order:", err);
      alert("Failed to save new order. Try again.");
      await fetchProducts();
    }
    setSavingOrder(false);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link
          href="/admin"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Slug (e.g. dashcam-lite)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Price (e.g. $39)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <div className="flex flex-col gap-3 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Product Images</label>

            {/* Upload button */}
            <label className={`flex items-center justify-center h-10 rounded border-2 border-dashed cursor-pointer text-sm transition-colors ${uploadingImage ? "border-gray-300 bg-gray-50 text-gray-400" : "border-teal-400 hover:bg-teal-50 text-teal-600"}`}>
              {uploadingImage ? "Uploading..." : "📁 Upload Image (click to add)"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </label>

            {/* Image list with reorder + delete */}
            {form.imagesText && form.imagesText.trim() && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Drag to reorder · First image is the main card image</p>
                {form.imagesText.split("\n").filter(Boolean).map((url, idx, arr) => (
                  <div
                    key={url}
                    className="flex items-center gap-3 border rounded-lg p-2 bg-white"
                  >
                    {/* Thumbnail */}
                    <img src={url} alt={`Image ${idx + 1}`} className="w-16 h-16 object-contain rounded border flex-shrink-0" />

                    {/* URL truncated */}
                    <span className="text-xs text-gray-400 truncate flex-1 min-w-0">{url.split("/").pop()}</span>

                    {/* Badge */}
                    {idx === 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex-shrink-0">Main</span>
                    )}

                    {/* Move up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const imgs = form.imagesText!.split("\n").filter(Boolean);
                        [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
                        setForm((prev) => ({ ...prev, imagesText: imgs.join("\n"), image: imgs[0] }));
                      }}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20 flex-shrink-0"
                      title="Move up"
                    >▲</button>

                    {/* Move down */}
                    <button
                      type="button"
                      disabled={idx === arr.length - 1}
                      onClick={() => {
                        const imgs = form.imagesText!.split("\n").filter(Boolean);
                        [imgs[idx], imgs[idx + 1]] = [imgs[idx + 1], imgs[idx]];
                        setForm((prev) => ({ ...prev, imagesText: imgs.join("\n"), image: imgs[0] }));
                      }}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20 flex-shrink-0"
                      title="Move down"
                    >▼</button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        const imgs = form.imagesText!.split("\n").filter(Boolean).filter((_, i) => i !== idx);
                        setForm((prev) => ({ ...prev, imagesText: imgs.join("\n"), image: imgs[0] ?? "" }));
                      }}
                      className="text-red-400 hover:text-red-600 flex-shrink-0 font-bold"
                      title="Remove"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden textarea still needed for the save logic */}
            <textarea
              className="hidden"
              value={form.imagesText}
              onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
            />
          </div>
          <input
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="External link"
            value={form.external_link}
            onChange={(e) =>
              setForm({ ...form, external_link: e.target.value })
            }
          />
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">Short Description</label>
            <div className="border rounded overflow-hidden">
              <QuillEditor
                value={form.short_description}
                onChange={(val: string) => setForm({ ...form, short_description: val })}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">Long Description</label>
            <div className="border rounded overflow-hidden min-h-[200px]">
              <QuillEditor
                value={form.long_description}
                onChange={(val: string) => setForm({ ...form, long_description: val })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
            />
            <span>Featured product</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published ?? true}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            <span>Published</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {editingId ? "Update Product" : "Create Product"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Existing Products</h2>
          <div className="flex items-center gap-2">
            {savingOrder && (
              <span className="text-sm text-teal-600 animate-pulse">
                Saving order...
              </span>
            )}
            <span className="text-xs text-gray-400">
              Drag to reorder
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {sortedProducts.map((p, idx) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`border rounded-lg p-4 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing transition-all ${
                dragIdx === idx
                  ? "opacity-50 scale-[0.98]"
                  : dragOverIdx === idx
                  ? "border-teal-400 bg-teal-50"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Drag handle */}
                <div className="flex flex-col gap-0.5 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    /{p.slug} · {p.price}{" "}
                    {p.featured ? "· Featured" : ""}{p.published === false ? " · Draft" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onEdit(p)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {sortedProducts.length === 0 && (
            <p className="text-gray-500">No products yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
