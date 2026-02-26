import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { ProductRecord } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products for Gig Workers",
  description:
    "Explore curated gear and tools built for gig drivers, delivery couriers, and rideshare workers.",
};

export default async function ProductsPage() {
  // Fetch products from Supabase (server-side)
  const { data: productsData, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  const products = (productsData ?? []) as ProductRecord[];

  if (error) {
    console.error("Failed to load products:", error.message);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">Gig World Today Store</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Tools that help you work smarter on every shift
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Discover practical products selected for busy gig workers — from delivery essentials to in-car organization and safety upgrades.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
