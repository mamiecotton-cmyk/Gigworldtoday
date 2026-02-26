"use client";

import Link from "next/link";
import ArticleForm from "@/components/ArticleForm";

export default function NewArticle() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        ← Back to Articles
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Create New Article</h1>
      <ArticleForm />
    </div>
  );
}