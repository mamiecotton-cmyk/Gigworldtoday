import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";

export default async function EditArticle({
  params,
}: {
  params: { id: string };
}) {
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!article) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">
        Edit Article
      </h1>

      <ArticleForm article={article} />
    </div>
  );
}
