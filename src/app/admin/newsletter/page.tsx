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
  const [showSource, setShowSource] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    sent?: number;
    failed?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/newsletter-drafts");
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    supabase
      .from("email_subscribers")
      .select("id", { count: "exact", head: true })
      .neq("status", "unsubscribed")
      .then(({ count }) => setSubscriberCount(count ?? 0));
    fetchDrafts();
  }, []);

  const saveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draftId, subject, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save draft");
      } else {
        setDraftId(data.draft.id);
        setResult({ message: "Draft saved successfully" });
        fetchDrafts();
      }
    } catch {
      setError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const loadDraft = (draft: any) => {
    setDraftId(draft.id);
    setSubject(draft.subject);
    setContent(draft.content);
    setShowDrafts(false);
    setResult(null);
    setError(null);
  };

  const deleteDraft = async (id: string) => {
    if (!confirm("Delete this draft?")) return;
    try {
      await fetch("/api/newsletter-drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (draftId === id) {
        setDraftId(null);
      }
      fetchDrafts();
    } catch {
      // ignore
    }
  };

  const newDraft = () => {
    setDraftId(null);
    setSubject("GigWorldToday Weekly Update");
    setContent("");
    setResult(null);
    setError(null);
  };

  const loadTemplate = async () => {
    try {
      const res = await fetch("/api/newsletter-template");
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        setShowSource(true);
        setResult({ message: "Template loaded — edit and send when ready" });
      }
    } catch {
      setError("Failed to load template");
    }
  };

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

      {/* Subscriber count & Drafts toggle */}
      <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Active Subscribers</p>
          <p className="text-2xl font-bold">
            {subscriberCount !== null ? subscriberCount : "…"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className="text-sm text-teal-600 hover:underline"
          >
            {showDrafts ? "Hide Drafts" : `Saved Drafts (${drafts.length})`}
          </button>
          <Link
            href="/admin/subscribers"
            className="text-sm text-teal-600 hover:underline"
          >
            Manage Subscribers →
          </Link>
        </div>
      </div>

      {/* Drafts list */}
      {showDrafts && (
        <div className="border rounded-lg divide-y">
          <div className="p-3 bg-gray-50 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Saved Drafts</p>
            <button
              onClick={newDraft}
              className="text-xs text-teal-600 hover:underline"
            >
              + New Draft
            </button>
          </div>
          {drafts.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No drafts saved yet.</p>
          ) : (
            drafts.map((d) => (
              <div
                key={d.id}
                className={`p-3 flex items-center justify-between hover:bg-gray-50 transition ${draftId === d.id ? "bg-teal-50 border-l-2 border-teal-500" : ""}`}
              >
                <button
                  onClick={() => loadDraft(d)}
                  className="text-left flex-1 min-w-0"
                >
                  <p className="font-medium text-sm truncate">
                    {d.subject || "(no subject)"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(d.updated_at).toLocaleString()}
                  </p>
                </button>
                <button
                  onClick={() => deleteDraft(d.id)}
                  className="text-xs text-red-500 hover:text-red-700 ml-3 shrink-0"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Newsletter Content
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadTemplate}
              className="text-xs text-gray-500 hover:underline"
            >
              Load Template
            </button>
            <button
              type="button"
              onClick={() => setShowSource(!showSource)}
              className="text-xs text-teal-600 hover:underline"
            >
              {showSource ? "Visual Editor" : "Edit HTML Source"}
            </button>
          </div>
        </div>
        {showSource ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 px-4 py-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
            placeholder="Paste or edit HTML here..."
          />
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <QuillEditor value={content} onChange={setContent} />
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {showSource
            ? "Editing raw HTML. Switch to Visual Editor to use the toolbar."
            : "Use the toolbar to format text, add links, images, and lists."}
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
      <div className="flex flex-wrap gap-3">
        <button
          onClick={saveDraft}
          disabled={saving || sending || testSending}
          className="px-5 py-2.5 border border-teal-500 text-teal-700 rounded-lg hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Spinner /> Saving…
            </>
          ) : draftId ? (
            "Update Draft"
          ) : (
            "Save as Draft"
          )}
        </button>

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
          <iframe
            srcDoc={`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
${content}
</body></html>`}
            className="w-full border rounded-lg bg-white"
            style={{ minHeight: 400 }}
            title="Newsletter preview"
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
