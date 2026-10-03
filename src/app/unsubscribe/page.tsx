"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "idle" | "loading" | "done" | "error";

function UnsubscribeForm() {
  const id = useSearchParams().get("id");
  const [status, setStatus] = useState<Status>("idle");

  const confirm = async () => {
    if (!id) return;
    setStatus("loading");

    try {
      const res = await fetch(`/api/unsubscribe?id=${encodeURIComponent(id)}`, {
        method: "POST",
      });

      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (!id) {
    return (
      <>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-3">Invalid link</h1>
        <p className="text-gray-700">
          This unsubscribe link looks incomplete. Please use the link in your most recent email.
        </p>
      </>
    );
  }

  if (status === "done") {
    return (
      <>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-3">You&apos;re unsubscribed</h1>
        <p className="text-gray-700 mb-6">
          You won&apos;t receive the GigWorldToday newsletter anymore. Sorry to see you go.
        </p>
        <Link href="/" className="font-semibold text-[#007C6E] underline">
          Back to GigWorldToday
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-3">Unsubscribe from the newsletter?</h1>
      <p className="text-gray-700 mb-6">
        Click below to stop receiving GigWorldToday emails.
      </p>
      <button
        onClick={confirm}
        disabled={status === "loading"}
        className="px-6 py-3 rounded-full font-bold bg-[#F97316] text-[#1A1A2E] hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Unsubscribing..." : "Yes, unsubscribe me"}
      </button>
      {status === "error" && (
        <p className="mt-4 text-red-700">
          Something went wrong. Please try again, or reply to any of our emails and we&apos;ll remove you.
        </p>
      )}
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10 text-center">
        <Suspense fallback={null}>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </div>
  );
}
