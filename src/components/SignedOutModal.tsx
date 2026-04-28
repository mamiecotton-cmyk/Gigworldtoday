"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function ModalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("signedOut") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  const dismiss = () => {
    setOpen(false);
    // Strip the query param so refresh doesn't re-show
    const params = new URLSearchParams(searchParams.toString());
    params.delete("signedOut");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-fade-in"
      >
        <img
          src="/gigsidekick-avatar.png"
          alt="GigSidekick"
          className="w-20 h-20 object-contain mx-auto mb-3"
        />
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">
          You've been signed out
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          See you next time!
        </p>
        <button
          onClick={dismiss}
          className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#00C9B1] to-teal-500 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-lg shadow-teal-500/20"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default function SignedOutModal() {
  return (
    <Suspense fallback={null}>
      <ModalContent />
    </Suspense>
  );
}
