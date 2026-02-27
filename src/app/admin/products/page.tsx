"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

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
          <input
            className="border rounded px-3 py-2"
            placeholder="Image path/url"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2 min-h-[120px]"
            placeholder={"One image URL per line"}
            value={form.imagesText}
            onChange={(e) =>
              setForm({ ...form, imagesText: e.target.value })
            }
          />
          <input
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="External link"
            value={form.external_link}
            onChange={(e) =>
              setForm({ ...form, external_link: e.target.value })
            }
          />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Short description"
            value={form.short_description}
            onChange={(e) =>
              setForm({ ...form, short_description: e.target.value })
            }
          />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2 min-h-[120px]"
            placeholder="Long description"
            value={form.long_description}
            onChange={(e) =>
              setForm({ ...form, long_description: e.target.value })
            }
          />
        </div>

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
                    {p.featured ? "· Featured" : ""}
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