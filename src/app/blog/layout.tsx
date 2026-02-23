import React, { ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type BlogLayoutProps = {
  children: ReactNode;
};

export default async function BlogLayout({ children }: BlogLayoutProps) {
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="max-w-5xl mx-auto px-6">
      <header className="pt-12 pb-8 border-b border-neutral-200">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Gig Economy Intelligence
            </h1>
            <p className="mt-4 text-neutral-600 max-w-xl">
              News, strategy, and tutorials for serious gig workers.
            </p>
          </div>

          <nav className="flex gap-6 text-sm">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/category/${cat.slug}`}
                className="text-neutral-600 hover:text-black transition"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="pt-12">{children}</div>
    </div>
  );
}