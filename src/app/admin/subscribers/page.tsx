"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Subscriber = {
  id: string;
  email: string;
  created_at: string;
};

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("email_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubscribers((data || []) as Subscriber[]);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await supabase.from("email_subscribers").delete().eq("id", id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleExport = () => {
    const csv = "Email,Subscribed Date\n" +
      subscribers
        .map((s) => `${s.email},${new Date(s.created_at).toLocaleDateString()}`)
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          {subscribers.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded border text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Export CSV
            </button>
          )}
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="rounded-xl border">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : subscribers.length === 0 ? (
          <p className="p-6 text-gray-500">No subscribers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold">Email</th>
                <th className="text-left px-6 py-3 font-semibold">Date</th>
                <th className="text-right px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-6 py-3">{s.email}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(s.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
