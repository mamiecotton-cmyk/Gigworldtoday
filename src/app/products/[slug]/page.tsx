import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import { supabase } from "@/lib/supabaseClient";
import { ProductRecord } from "@/lib/products";

type Params = { slug: string };

export async function generateStaticParams() {
  const { data, error } = await supabase.from("products").select("slug");
  if (error || !data) return [];
  return data.map((p: any) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from("products").select("*").eq("slug", slug).limit(1).single();
  if (!data) return { title: "Product Not Found" };
  return { title: `${data.name} | Products`, description: data.short_description };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { data: product, error } = await supabase.from("products").select("*").eq("slug", slug).limit(1).single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <ProductGallery product={product!} />
          <div className="space-y-6 p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Product</p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{product!.name}</h1>
            <p className="text-base leading-relaxed text-gray-600 md:text-lg">{product!.long_description}</p>
            <div className="text-2xl font-bold text-gray-900">{product!.price}</div>

            <a
              href={product!.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-md"
            >
              View External Product Link
            </a>

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
