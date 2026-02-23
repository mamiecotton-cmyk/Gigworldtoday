"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CommentForm({ articleId }: { articleId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to comment.");
      setLoading(false);
      return;
    }

    await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content,
    });

    setContent("");
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full border rounded-md p-4 min-h-[120px]"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-black text-white rounded-md"
      >
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
