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

  const description = product.long_description || product.short_description || "";

  // Parse description: split into paragraphs and bullet points
  const lines = description.split("\n").map((l: string) => l.trim()).filter(Boolean);
  const paragraphs: string[] = [];
  const bulletPoints: string[] = [];

  lines.forEach((line: string) => {
    if (line.startsWith("•") || line.startsWith("—") || line.startsWith("-")) {
      bulletPoints.push(line.replace(/^[•—-]\s*/, ""));
    } else {
      paragraphs.push(line);
    }
  });

  const isFeatured = product.featured === true;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: isFeatured
            ? "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2d6a8a 70%, #4a9bb5 100%)"
            : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">
                {isFeatured ? "Featured Product" : "Product"}
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                {product.name}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
                {product.short_description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-3xl font-bold text-white">{product.price}</span>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {product.external_link && (
                  <a
                    href={product.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/30"
                  >
                    {isFeatured ? "Get the Book →" : "Buy Now →"}
                  </a>
                )}
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Browse Products
                </Link>
              </div>
            </div>

            {/* Right: Product Image */}
            {images.length > 0 && (
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-4 rounded-2xl bg-black/30 blur-2xl" />
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="relative z-10 max-h-[480px] w-auto rounded-lg object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description Section */}
      {description && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
            <div className={bulletPoints.length > 0 ? "grid gap-12 lg:grid-cols-2" : ""}>
              {/* Paragraphs */}
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                  About This Product
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {product.name}
                </h2>
                {paragraphs.length > 0 ? (
                  <div className="space-y-3 text-gray-600 leading-relaxed">
                    {paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                )}
              </div>

              {/* Bullet points (if any) */}
              {bulletPoints.length > 0 && (
                <div className="space-y-4 lg:pt-12">
                  {bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                      <p className="text-gray-700 font-medium">{point}</p>
                    </div>
                  ))}

                  <div className="pt-6">
                    {product.external_link && (
                      <a
                        href={product.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-md"
                      >
                        View Product →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Additional Images */}
      {images.length > 1 && (
        <section className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              More Images
            </p>
            <div className="flex gap-4 overflow-x-auto">
              {images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="h-48 w-36 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Navigation */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-6 py-6 lg:px-8">
          <Link
            href="/products"
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
          >
            ← Back to Products
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
          >
            Back to Homepage
          </Link>
        </div>
      </section>
    </div>
  );
}