"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/components/QuillEditor"), {
  ssr: false,
});

export default function AdminNewsletterPage() {
  const [subject, setSubject] = useState("GigWorldToday Weekly Update");
  const [content, setContent] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    sent?: number;
    failed?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("email_subscribers")
      .select("id", { count: "exact", head: true })
      .neq("status", "unsubscribed")
      .then(({ count }) => setSubscriberCount(count ?? 0));
  }, []);

  const sendNewsletter = async (testOnly: boolean) => {
    setResult(null);
    setError(null);

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!content.trim()) {
      setError("Newsletter content is required");
      return;
    }

    if (!testOnly) {
      const confirmText = prompt(
        `This will send the newsletter to ${subscriberCount ?? "all"} active subscribers.\n\nType SEND to confirm:`
      );
      if (confirmText !== "SEND") return;
    }

    testOnly ? setTestSending(true) : setSending(true);

    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          testOnly,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send newsletter");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error — please try again");
    } finally {
      setSending(false);
      setTestSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Send Newsletter</h1>
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-black transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Subscriber count */}
      <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Active Subscribers</p>
          <p className="text-2xl font-bold">
            {subscriberCount !== null ? subscriberCount : "…"}
          </p>
        </div>
        <Link
          href="/admin/subscribers"
          className="text-sm text-teal-600 hover:underline"
        >
          Manage Subscribers →
        </Link>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
          placeholder="Newsletter subject line..."
        />
      </div>

      {/* Content editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Newsletter Content
        </label>
        <div className="border rounded-lg overflow-hidden">
          <QuillEditor value={content} onChange={setContent} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Use the toolbar to format text, add links, images, and lists.
        </p>
      </div>

      {/* Status messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <p className="font-semibold">{result.message}</p>
          {result.sent !== undefined && (
            <p className="text-sm mt-1">
              {result.sent} sent · {result.failed} failed
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => sendNewsletter(true)}
          disabled={testSending || sending}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {testSending ? (
            <>
              <Spinner /> Sending Test…
            </>
          ) : (
            "Send Test Email"
          )}
        </button>

        <button
          onClick={() => sendNewsletter(false)}
          disabled={sending || testSending}
          className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {sending ? (
            <>
              <Spinner /> Sending Newsletter…
            </>
          ) : (
            `Send Newsletter${subscriberCount !== null ? ` to ${subscriberCount} Subscribers` : ""}`
          )}
        </button>
      </div>

      {/* Preview */}
      {content && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <div
            className="p-6 border rounded-lg bg-white prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
