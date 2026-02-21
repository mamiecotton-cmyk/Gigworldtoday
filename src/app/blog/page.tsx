import type { Metadata } from "next";
import Link from "next/link";

import { getBlogPosts } from "./posts";

export const metadata: Metadata = {
  title: "GigWorldToday Blog | Insights for Gig Workers",
  description:
    "Explore practical insights, platform strategies, and financial tips for gig workers. Stay updated with guidance to help you earn smarter and work sustainably.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Insights & Updates
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          GigWorldToday Blog
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">
          Actionable guidance, trends, and practical advice to help gig workers
          make informed decisions and grow their earning potential.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <time className="text-sm text-slate-500" dateTime={post.date}>
              {dateFormatter.format(new Date(post.date))}
            </time>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              {post.title}
            </h2>
            <p className="mt-3 flex-1 text-slate-600">{post.summary}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-5 inline-flex w-fit items-center text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Read more →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
