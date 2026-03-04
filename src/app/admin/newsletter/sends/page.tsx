"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NewsletterSend {
  id: string;
  subject: string;
  content: string;
  recipients: number;
  sent: number;
  failed: number;
  is_test: boolean;
  sent_at: string;
}

export default function SentNewslettersPage() {
  const [sends, setSends] = useState<NewsletterSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/newsletter-sends")
      .then((r) => r.json())
      .then((d) => setSends(d.sends || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const previewSend = sends.find((s) => s.id === previewId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sent Newsletters</h1>
        <Link
          href="/admin/newsletter"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Compose Newsletter
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : sends.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No newsletters sent yet.</p>
          <Link href="/admin/newsletter" className="text-teal-600 underline mt-2 inline-block">
            Send your first newsletter →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Total Sends</p>
              <p className="text-2xl font-bold">{sends.filter((s) => !s.is_test).length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Test Sends</p>
              <p className="text-2xl font-bold">{sends.filter((s) => s.is_test).length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Total Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {sends.reduce((acc, s) => acc + s.sent, 0)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Total Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {sends.reduce((acc, s) => acc + s.failed, 0)}
              </p>
            </div>
          </div>

          {/* Sends table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Subject</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Recipients</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Sent</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Failed</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sends.map((send) => (
                  <tr key={send.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">
                      {send.subject}
                    </td>
                    <td className="px-4 py-3">
                      {send.is_test ? (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Test
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Live
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{send.recipients}</td>
                    <td className="px-4 py-3 text-green-600">{send.sent}</td>
                    <td className="px-4 py-3 text-red-600">{send.failed}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(send.sent_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          setPreviewId(previewId === send.id ? null : send.id)
                        }
                        className="text-teal-600 hover:underline text-xs"
                      >
                        {previewId === send.id ? "Hide" : "Preview"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview panel */}
          {previewSend && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Preview: {previewSend.subject}</h3>
                <button
                  onClick={() => setPreviewId(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              </div>
              {previewSend.content ? (
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;}</style></head><body>${previewSend.content}</body></html>`}
                  className="w-full border rounded"
                  style={{ minHeight: 300 }}
                  title="Newsletter Preview"
                />
              ) : (
                <p className="text-gray-400 italic">
                  No content stored for this send.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pt-4">
        <Link href="/admin" className="text-gray-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
