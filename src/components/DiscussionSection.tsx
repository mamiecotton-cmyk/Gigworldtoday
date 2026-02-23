"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CommentForm from "./CommentForm";

export default function DiscussionSection({
  articleId,
  comments,
}: {
  articleId: string;
  comments: any[];
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    getUser();
  }, []);

  return (
    <div className="mt-24 border-t border-neutral-200 pt-12">
      <h2 className="text-2xl font-semibold tracking-tight">
        Discussion
      </h2>

      {comments?.length ? (
        <p className="mt-3 text-sm text-neutral-500">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="mt-8">
        {user ? (
          <CommentForm articleId={articleId} />
        ) : (
          <p className="text-sm text-neutral-600">
            <Link href="/login" className="underline">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}
      </div>

      {comments?.length ? (
        <div className="mt-10 space-y-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="pb-8 border-b border-neutral-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-800">
                  {comment.profiles?.full_name ?? "Member"}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>

              <p className="text-neutral-700 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-neutral-500">
          No comments yet.
        </p>
      )}
    </div>
  );
}
