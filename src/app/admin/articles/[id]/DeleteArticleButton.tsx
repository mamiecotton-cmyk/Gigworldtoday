"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      // 1. List files in storage
      const { data: files, error: listError } = await supabase.storage
        .from("article-images")
        .list(`articles/${id}`);
      if (listError) throw listError;
      if (files && files.length > 0) {
        // Remove all files in the folder
        const paths = files.map((f) => `articles/${id}/${f.name}`);
        const { error: removeError } = await supabase.storage
          .from("article-images")
          .remove(paths);
        if (removeError) throw removeError;
      }
      // 2. Delete article row
      const { error: deleteError } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      // 3. Redirect
      router.push("/admin/articles");
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="mb-2 text-red-700 font-semibold">Danger Zone</div>
      <div className="mb-2 text-sm">To delete this article, type <b>DELETE</b> below and confirm.</div>
      <input
        className="border p-2 w-48 mr-2"
        placeholder="Type DELETE to confirm"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        disabled={busy}
      />
      <button
        className="border px-4 py-2 text-red-700 disabled:opacity-50"
        type="button"
        disabled={busy || confirmText !== "DELETE"}
        onClick={handleDelete}
      >
        {busy ? "Deleting..." : "Delete Article"}
      </button>
      {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
    </div>
  );
}
