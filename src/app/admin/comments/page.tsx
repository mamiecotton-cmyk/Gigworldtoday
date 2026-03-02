"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CommentsAdmin() {
  const [comments, setComments] = useState<any[]>([]);
  const [filter, setFilter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    let query = supabase
      .from("comments")
      .select("id, content, user_email, approved, created_at, article_id, articles(title, slug)")
      .order("created_at", { ascending: false });

    if (filter !== null) {
      query = query.eq("approved", filter);
    }

    const { data } = await query;
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const updateApproval = async (id: string, approved: boolean) => {
    await supabase.from("comments").update({ approved, updated_at: new Date().toISOString() }).eq("id", id);
    fetchComments();
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Permanently delete this comment?")) return;
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Comment Moderation</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === null ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === true ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === false ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments found.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.user_email || "Unknown user"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    comment.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {comment.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                {comment.articles && (
                  <p className="text-xs text-teal-600 mb-2">on: {comment.articles.title}</p>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>

              <div className="flex gap-2 mt-4">
                {!comment.approved && (
                  <button
                    onClick={() => updateApproval(comment.id, true)}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    ✓ Approve
                  </button>
                )}
                {comment.approved && (
                  <button
                    onClick={() => updateApproval(comment.id, false)}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  >
                    ✕ Unapprove
                  </button>
                )}
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
