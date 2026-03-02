"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ArticleComments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser((data as any)?.user));

    supabase
      .from("comments")
      .select("id, content, user_email, created_at")
      .eq("article_id", articleId)
      .eq("approved", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data || []));
  }, [articleId]);

  const handleSubmit = async () => {
    if (!body.trim() || !user) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      user_email: user.email,
      content: body.trim(),
      approved: false,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setBody("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
    setSubmitting(false);
  };

  const displayEmail = (email: string) => {
    if (!email) return "User";
    const [name] = email.split("@");
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Comments</h2>

      {comments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {(comment.user_email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {displayEmail(comment.user_email)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-8">No comments yet. Be the first to share your thoughts!</p>
      )}

      {user ? (
        <div className="space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {submitted && (
            <p className="text-green-600 text-sm">✓ Comment submitted! It will appear after moderation.</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || !body.trim()}
            className="px-5 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition"
          >
            {submitting ? "Submitting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Sign in to leave a comment</p>
          <a
            href="/login"
            className="inline-block px-5 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition"
          >
            Sign In
          </a>
        </div>
      )}
    </div>
  );
}
