"use client";
import { useEffect, useMemo, useState } from "react";
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

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      if (!res.ok) {
        alert(json?.error || 'Failed to load products');
        return;
      }
      setProducts((json.data ?? []) as ProductRow[]);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch products');
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
    // require core fields
    if (!form.name || !form.slug || !form.short_description || !form.long_description || !form.price || !form.external_link) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    if (editingId) {
      const images = (form.imagesText ? form.imagesText : (form.images || []).join("\n"))
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
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const json = await res.json();
        setLoading(false);
        if (!res.ok) {
          alert(json?.error || 'Failed to update product');
          return;
        }
        await fetchProducts();
        resetForm();
      } catch (err: any) {
        setLoading(false);
        alert(err.message || 'Failed to update product');
      }
      return;
    }
    const images = (form.imagesText ? form.imagesText : (form.images || []).join("\n"))
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
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        alert(json?.error || 'Failed to create product');
        return;
      }
      await fetchProducts();
      resetForm();
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Failed to create product');
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
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json?.error || 'Failed to delete product');
        return;
      }
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? "Edit Product" : "Add Product"}</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Slug (e.g. dashcam-lite)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Price (e.g. $39)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Image path/url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2 min-h-[120px]"
            placeholder={"One image URL per line"}
            value={form.imagesText}
            onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
          />
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="External link" value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} />
          <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Short description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
          <textarea className="border rounded px-3 py-2 md:col-span-2 min-h-[120px]" placeholder="Long description" value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} />
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          <span>Featured product</span>
        </label>

        <div className="flex gap-3">
          <button onClick={onSave} disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
            {editingId ? "Update Product" : "Create Product"}
          </button>

          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 rounded border">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Existing Products</h2>
        <div className="space-y-3">
          {sortedProducts.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">/{p.slug} · {p.price} {p.featured ? "· Featured" : ""}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(p)} className="text-blue-600">Edit</button>
                <button onClick={() => onDelete(p.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {sortedProducts.length === 0 && <p className="text-gray-500">No products yet.</p>}
        </div>
      </div>
    </div>
  );
}
