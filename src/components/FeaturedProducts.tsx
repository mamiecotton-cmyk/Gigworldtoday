"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { ProductRecord } from "@/lib/products";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .limit(6);

      setProducts((data || []) as ProductRecord[]);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container mx-auto px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Featured Picks</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Driver-Focused Products</h2>
          </div>
          <Link
            href="/products"
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-white hover:shadow"
          >
            View All Products
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading featured products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
