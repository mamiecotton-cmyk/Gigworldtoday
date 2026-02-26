import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseServer";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("name, short_description")
    .eq("slug", slug)
    .single();

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Products`,
    description: product.short_description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 p-4 border-b border-gray-100">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="space-y-6 p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Product</p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {product.name}
            </h1>
            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              {product.long_description || product.short_description}
            </p>
            <div className="text-2xl font-bold text-gray-900">{product.price}</div>

            {product.external_link && (
              <a
                href={product.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-md"
              >
                View on Amazon →
              </a>
            )}

            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-6">
              <Link href="/products" className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900">
                ← Back to Products
              </Link>
              <Link href="/" className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900">
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}