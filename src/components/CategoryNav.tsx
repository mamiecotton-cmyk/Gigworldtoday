"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CategoryNav() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      setCategories(data ?? []);
    }

    fetchCategories();
  }, []);

  if (!categories.length) return null;

  // Determine active category from window location
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <div className="flex flex-wrap gap-4 mt-8 border-b border-neutral-200 pb-6">
      {categories.map((category) => {
        const active = currentPath.includes(`/blog/category/${category.slug}`);
        return (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className={`relative text-sm hover:text-black transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-black after:transition-all ${
              active ? "text-black font-medium after:w-full" : "text-neutral-600"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
