import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  content_type: "news" | "analysis" | "tutorial";
  reading_time: number | null;
  featured: boolean | null;
  featured_image: string | null;
  published: boolean;
  published_at: string | null;
};

export default async function BlogPage() {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const articles: Article[] = (data ?? []) as Article[];

  const featured = articles.find((a: Article) => a.featured);
  const news = articles
    .filter((a: Article) => a.content_type === "news")
    .slice(0, 6);
  const tutorials = articles
    .filter((a: Article) => a.content_type === "tutorial")
    .slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 divide-y divide-neutral-200">

      <header className="mb-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          Gig Economy Intelligence
        </h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
          News, strategy, and tutorials for serious gig workers.
        </p>
      </header>

      {featured && (
        <section className="mb-20">
          <Link href={`/blog/${featured.slug}`} className="group block">
            {featured.featured_image && (
              <div className="relative h-[480px] w-full mb-6">
                <Image
                  src={featured.featured_image}
                  alt={featured.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            )}
            <h2 className="text-3xl font-semibold group-hover:underline">
              {featured.title}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-3xl">
              {featured.excerpt}
            </p>
          </Link>
        </section>
      )}

      {news.length > 0 && (
        <section className="mb-20">
          <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6">
            Latest News
          </h3>
          <div className="h-px bg-neutral-200 mb-10"></div>

          <div className="space-y-6">
            {news.map((article: Article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-500 border px-2 py-1 rounded">
                    {article.content_type}
                  </span>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium hover:underline">
                      {article.title}
                    </h4>
                    <span className="text-sm text-neutral-500">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6">
          Tutorials
        </h3>
        <div className="h-px bg-neutral-200 mb-10"></div>

        <div className="grid md:grid-cols-2 gap-12">
          {tutorials.map((article: Article) => (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-neutral-500 border px-2 py-1 rounded">
                  {article.content_type}
                </span>
                {article.featured_image && (
                  <div className="relative h-64 w-full mb-4">
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <h4 className="font-semibold hover:underline">
                  {article.title}
                </h4>
                <p className="text-neutral-600 mt-3">
                  {article.excerpt}
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  {article.published_at &&
                    new Date(article.published_at).toLocaleDateString()}
                </p>
                {article.reading_time && (
                  <p className="text-sm text-neutral-500 mt-2">
                    {article.reading_time} min read
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}