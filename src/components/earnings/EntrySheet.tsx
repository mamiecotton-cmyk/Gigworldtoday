"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  platform: { id: string; name: string } | null;
  defaultDate: string;
  prefill?: { base_pay?: string; tips?: string; date?: string } | null;
  onClose: () => void;
  onSave: (values: { base_pay: string; tips: string; date: string }) => Promise<void>;
}

export default function EntrySheet({ open, platform, defaultDate, prefill, onClose, onSave }: Props) {
  const [basePay, setBasePay] = useState("");
  const [tips, setTips] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef(0);

  // Reset on open
  useEffect(() => {
    if (open) {
      setBasePay(prefill?.base_pay ?? "");
      setTips(prefill?.tips ?? "");
      setDate(prefill?.date ?? defaultDate);
      setShowDate(false);
      setError(null);
    }
  }, [open, defaultDate, prefill]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || !platform) return null;

  const total =
    (parseFloat(basePay) || 0) + (parseFloat(tips) || 0);

  const handleSave = async () => {
    if (basePay === "" && tips === "") {
      setError("Enter base pay or tips");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ base_pay: basePay, tips, date });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  };

  // Swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && sheetRef.current) {
      touchDeltaY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };
  const handleTouchEnd = () => {
    if (sheetRef.current) {
      if (touchDeltaY.current > 80) {
        onClose();
      } else {
        sheetRef.current.style.transform = "";
      }
    }
    touchStartY.current = null;
    touchDeltaY.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-lg bg-white rounded-t-3xl px-5 pt-3 pb-6 shadow-2xl animate-slide-up"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Drag handle */}
        <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-base">
            💼
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A2E]">{platform.name}</p>
            <button
              onClick={() => setShowDate(!showDate)}
              className="text-xs text-gray-500 hover:text-teal-600"
            >
              {date === defaultDate ? "Today" : new Date(date).toLocaleDateString()} · Change
            </button>
          </div>
        </div>

        {showDate && (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00C9B1] outline-none"
          />
        )}

        {/* Base Pay */}
        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
          Base Pay
        </label>
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={basePay}
            onChange={(e) => setBasePay(e.target.value)}
            placeholder="0.00"
            autoFocus
            className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-base focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none"
          />
        </div>

        {/* Tips */}
        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
          Tips
        </label>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="0.00"
            className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-base focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || total === 0}
          className="w-full py-3 rounded-xl font-semibold text-white bg-[#1A1A2E] hover:bg-[#0f3460] disabled:opacity-40 transition-all"
        >
          {saving ? "Saving..." : total > 0 ? `Save · $${total.toFixed(2)}` : "Save"}
        </button>

        {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
}