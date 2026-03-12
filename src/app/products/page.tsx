import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products for Gig Workers",
  description:
    "Explore curated gear and tools built for gig drivers, delivery couriers, and rideshare workers.",
};

export default async function ProductsPage() {
  const supabase = createServerSupabase();
  const { data: productsData, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const products = productsData ?? [];

  // Ensure featured products surface to the top (limit to top 3 featured)
  const featured = (products as any[]).filter((p) => p.featured).slice(0, 3);
  const featuredIds = new Set(featured.map((f) => f.id));
  const orderedProducts = [...featured, ...((products as any[]).filter((p) => !featuredIds.has(p.id)))];

  if (error) {
    console.error("Failed to load products:", error.message);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative w-full h-[28vh] md:h-[50vh] min-h-[220px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/productsbackground.jpeg"
            alt="City skyline background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Character — adjusted to avoid overlapping the hero text */}
        <div className="absolute bottom-0 right-[2%] h-[80%] md:right-[19%] md:h-[95%] pointer-events-none transform-gpu z-0">
          <Image
            src="/ProductCharacter.png"
            alt="Delivery rider"
            width={1100}
            height={1050}
            priority
            className="h-full w-auto object-contain object-bottom"
          />
        </div>

        {/* Text content */}
        <div className="relative z-20 h-full flex items-start pt-6 md:items-center md:pt-0">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
              <div className="max-w-[65%] text-center md:max-w-lg md:text-left md:mx-0 md:ml-[8%]">
              <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                The Tools to Boost Your Gigs
              </h1>
              <p className="mt-1 md:mt-3 text-xs sm:text-sm md:text-xl text-gray-200 leading-relaxed">
                Gear and apps to help drivers maximize earnings and operate like 5-star pros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 py-6 md:py-14 lg:px-8">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {orderedProducts.map((product: any) => {
              const isAmazonUrl = (url: string) =>
                /amazon\.com|media-amazon\.com|ssl-images-amazon/i.test(url ?? "");
              const rawImage = product.images?.[0] || product.image || "";
              const primaryImage = rawImage && !isAmazonUrl(rawImage) ? rawImage : "/city-background.jpg";
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-orange-50/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal-300"
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-orange-400" />

                  {/* Featured badge */}
                  {product.featured && (
                    <div className="absolute top-3 right-3 z-20 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                      ⭐ Featured
                    </div>
                  )}

                  <div className="w-full overflow-hidden bg-white/60 flex items-center justify-center p-3">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="h-44 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      {product.price && !isAmazonUrl(product.external_link ?? "") && (
                        <span className="text-sm font-bold text-teal-700 bg-teal-100 rounded-full border border-teal-200 px-3 py-1">
                          {product.price}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">
                      {product.short_description}
                    </p>
                    <span className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition-all group-hover:from-teal-600 group-hover:to-teal-700 group-hover:shadow-md">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}