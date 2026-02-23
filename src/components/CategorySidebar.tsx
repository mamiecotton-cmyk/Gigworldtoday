"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CategorySidebar() {
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

  return (
    <div className="sticky top-24">
      <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6">
        Categories
      </h3>

      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/blog/category/${category.slug}`}
              className="text-neutral-700 hover:text-black transition-colors"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
