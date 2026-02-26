import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabaseServer";
export default async function Page() {
  const supabase = createServerSupabase();
  const { data: articlesData } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false });
  const articles = articlesData ?? [];
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <header className="pt-10 pb-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          Gig Economy Intelligence
        </h1>
        <p className="mt-3 text-lg text-neutral-600 max-w-2xl">
          News, strategy, and tutorials for serious gig workers.
        </p>
      </header>
      {/* Category Navigation */}
      <div className="flex flex-wrap gap-6 mt-6 mb-10 border-b border-neutral-200 pb-4">
        <Link
          href="/blog"
          className="text-sm text-neutral-700 hover:text-black transition"
        >
          All
        </Link>
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className="text-sm text-neutral-700 hover:text-black transition"
          >
            {category.name}
          </Link>
        ))}
      </div>
      {/* Article Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-neutral-100"
          >
            {article.featured_image && (
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:underline">
                {article.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 line-clamp-3">
                {article.excerpt}
              </p>
              <p className="mt-4 text-xs text-neutral-500">
                {article.published_at &&
                  new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}