"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setArticles(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">
        Articles
      </h1>

      <Link
        href="/admin/articles/new"
        className="inline-block mb-6 px-4 py-2 bg-black text-white rounded"
      >
        + New Article
      </Link>

      <div className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 border rounded flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {article.title}
              </p>
              <p className="text-sm text-gray-500">
                {article.published ? "Published" : "Draft"}
              </p>
            </div>

            <Link
              href={`/admin/articles/${article.id}`}
              className="text-blue-600"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
