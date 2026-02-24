"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const router = useRouter();

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    setArticles(data || []);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmText = prompt("Type DELETE to remove this article:");
    if (confirmText !== "DELETE") return;

    const { error } = await supabase
      .from("articles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchArticles();
  };

  const publishedCount = articles.filter(a => a.published).length;
  const draftCount = articles.filter(a => !a.published).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <p className="text-sm text-gray-500">Total Articles</p>
          <p className="text-2xl font-bold">{articles.length}</p>
        </div>

        <div className="p-6 border rounded-lg">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold">{publishedCount}</p>
        </div>

        <div className="p-6 border rounded-lg">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold">{draftCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-black text-white rounded"
        >
          + New Article
        </Link>
      </div>

      {/* Recent Articles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Recent Articles
        </h2>

        <div className="space-y-4">
          {articles.slice(0, 5).map(article => (
            <div
              key={article.id}
              className="p-4 border rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-sm text-gray-500">
                  {article.published ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(article.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}