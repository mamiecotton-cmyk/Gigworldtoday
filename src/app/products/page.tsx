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

        {/* Character — scaled down on mobile */}
        <div className="absolute bottom-0 right-[10%] h-[75%] md:right-0 md:h-full pointer-events-none">
          <Image
            src="/ProductCharacter.png"
            alt="Delivery rider"
            width={950}
            height={910}
            priority
            className="h-full w-auto object-contain object-bottom"
          />
        </div>

        {/* Text content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="max-w-[55%] sm:max-w-[60%] md:max-w-lg">
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
            {products.map((product: any) => {
              const primaryImage = product.images?.[0] || product.image || "/city-background.jpg";
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="w-full overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="h-44 w-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                      {product.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{product.price}</span>
                      <span className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-gray-700">
                        View Details
                      </span>
                    </div>
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