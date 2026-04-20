"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import platformsData from "@/data/platforms.json";

// ─── Types ────────────────────────────────────────────────────────────────────
type Vehicle = "car" | "truck" | "bike_scooter" | "phone_only" | "";
type GigType =
  | "food_delivery"
  | "medical_courier"
  | "rideshare"
  | "pet_care"
  | "tasks"
  | "packages"
  | "not_sure"
  | "";
type Schedule = "on_demand" | "set_schedule" | "weekends" | "";
type PaySpeed = "same_day" | "weekly" | "";

interface QuizAnswers {
  vehicle: Vehicle | "";
  gigType: GigType | "";
  schedule: Schedule | "";
  paySpeed: PaySpeed | "";
  location: string;
}

// ─── Matching maps ─────────────────────────────────────────────────────────────
const GIG_TO_CATEGORIES: Record<Exclude<GigType, "">, string[]> = {
  food_delivery: ["food_delivery"],
  medical_courier: ["medical_courier", "healthcare_delivery"],
  rideshare: ["rideshare"],
  pet_care: ["pet_care"],
  tasks: ["task_based"],
  packages: ["package_delivery", "courier", "same_day_delivery"],
  not_sure: [], // no category filter → show all
};

const VEHICLE_TO_TYPES: Record<Exclude<Vehicle, "">, string[]> = {
  car: ["car", "suv", "sedan", "van", "cargo_van", "pickup"],
  truck: ["pickup", "box_truck", "cargo_van", "van", "sprinter_van", "refrigerated_van", "car", "suv", "sedan", "none", "walking"],
  bike_scooter: ["bike", "scooter", "none", "walking"],
  phone_only: ["none", "walking"], // platforms.json uses "none"; page.tsx normalizes to "walking"
};

const SCHEDULE_TO_DELIVERY: Record<Exclude<Schedule, "">, string[]> = {
  on_demand: ["on_demand"],
  set_schedule: ["scheduled"],
  weekends: ["on_demand", "scheduled"], // either works for weekends
};

const inactiveStatuses = [
  "absorbed","merged","rebranded","shut_down","shutdown",
  "permanently_closed","no_longer_hiring","not_hiring","closed",
  "inactive","defunct","acquired","out_of_business","retired",
  "discontinued","suspended","paused","terminated","ended",
  "legacy","archived",
];

// ─── Platform matcher ──────────────────────────────────────────────────────────
function matchPlatforms(answers: QuizAnswers) {
  const all = (platformsData as any[]).filter(
    (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
  );

  const filtered = all.filter((p) => {
    // Vehicle match
    if (answers.vehicle) {
      const allowed = VEHICLE_TO_TYPES[answers.vehicle as Exclude<Vehicle, "">];
      const pVehicles: string[] = p.vehicleTypes || [];
      if (!pVehicles.some((v: string) => allowed.includes(v))) return false;
    }

    // Category match (skip if "not_sure")
    if (answers.gigType && answers.gigType !== "not_sure") {
      const cats = GIG_TO_CATEGORIES[answers.gigType as Exclude<GigType, "">];
      const pCats: string[] = p.categories || [];
      if (!pCats.some((c: string) => cats.includes(c))) return false;
    }

    // Schedule match
    if (answers.schedule) {
      const allowed = SCHEDULE_TO_DELIVERY[answers.schedule as Exclude<Schedule, "">];
      if (p.deliveryType && !allowed.includes(p.deliveryType)) return false;
    }

    // Pay speed match
    if (answers.paySpeed === "same_day") {
      if (!p.instantPayAvailable) return false;
    }

    // Location: basic city/state match against regions
    if (answers.location.trim()) {
      const loc = answers.location.trim().toLowerCase();
      const isZip = /^\d{5}$/.test(loc.trim());
      if (!isZip) {
        // city name check — if platform has cities listed, try to match
        const regions: Record<string, any> = p.regions || {};
        let hasMatch = false;
        let isNationwide = false;
        for (const region of Object.values(regions)) {
          const status: string = (region.status || "").toLowerCase();
          if (
            status.includes("nationwide") ||
            status.includes("available") ||
            status === "active"
          ) {
            const cities: string[] = region.cities || [];
            if (cities.length === 0) {
              isNationwide = true;
              break;
            }
          }
          const cities: string[] = region.cities || [];
          if (cities.some((c: string) => c.toLowerCase().includes(loc))) {
            hasMatch = true;
            break;
          }
        }
        if (!isNationwide && !hasMatch) return false;
      }
      // ZIP codes: just pass through — we don't block on ZIP since most
      // platforms don't have zip-level data; we show all matches and let
      // the full /platforms search do fine-grained filtering
    }

    return true;
  });

  // ── Score and sort by vehicle relevance, then pay ──────────────────────────
  const EXACT_VEHICLE_TYPES: Record<Exclude<Vehicle, "">, string[]> = {
    car: ["car", "suv", "sedan"],
    truck: ["pickup", "box_truck", "cargo_van", "van", "sprinter_van", "refrigerated_van"],
    bike_scooter: ["bike", "scooter"],
    phone_only: ["none", "walking"],
  };

  return filtered.sort((a, b) => {
    const scoreP = (p: any): number => {
      let score = 0;
      const pVehicles: string[] = p.vehicleTypes || [];

      // Exact vehicle match — highest priority
      if (answers.vehicle) {
        const exactTypes = EXACT_VEHICLE_TYPES[answers.vehicle as Exclude<Vehicle, "">];
        if (pVehicles.some((v: string) => exactTypes.includes(v))) {
          score += 100;
        }
      }

      // Verified platforms
      if (p.verificationStatus === "verified") score += 10;

      // Higher pay
      score += (p.estimatedHourlyMax || 0) * 0.5;

      // Instant pay is a bonus
      if (p.instantPayAvailable) score += 5;

      return score;
    };

    return scoreP(b) - scoreP(a);
  });
}

// ─── Logo helpers (mirrors PlatformCard) ──────────────────────────────────────
const LOCAL_LOGOS: Record<string, string> = {
  doordash: "/logos/doordash.svg",
  ubereats: "/logos/ubereats.svg",
  instacart: "/logos/instacart.svg",
  uber: "/logos/uber.svg",
  lyft: "/logos/lyft.svg",
  thumbtack: "/logos/thumbtack.svg",
};
const DOMAIN_OVERRIDES: Record<string, string> = {
  doordash: "doordash.com",
  ubereats: "ubereats.com",
  drizly: "drizly.com",
  postmates: "postmates.com",
};

function getPlatformLogo(p: any): string | null {
  if (LOCAL_LOGOS[p.id]) return LOCAL_LOGOS[p.id];
  if (p.logoUrl) return p.logoUrl;
  const domain =
    DOMAIN_OVERRIDES[p.id] ||
    (() => {
      try {
        const parts = new URL(p.websiteUrl || "").hostname
          .replace(/^www\./, "")
          .split(".");
        return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
      } catch {
        return null;
      }
    })();
  return domain
    ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
    : null;
}

// ─── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    emoji: "🚗",
    question: "What's your mode of transportation?",
    subtitle: "I'll only show gigs you can actually do.",
    options: [
      { value: "car", icon: "🚗", label: "Car or SUV" },
      { value: "truck", icon: "🚚", label: "Truck or Van" },
      { value: "bike_scooter", icon: "🚲", label: "Bike or Scooter" },
      { value: "phone_only", icon: "🚶", label: "On foot / just my phone" },
    ],
  },
  {
    id: 2,
    emoji: "🎯",
    question: "What type of gig are you looking for?",
    subtitle: "Pick the one that interests you most.",
    options: [
      { value: "food_delivery", icon: "🍔", label: "Food Delivery" },
      { value: "medical_courier", icon: "🏥", label: "Medical Courier" },
      { value: "rideshare", icon: "🚕", label: "Rideshare" },
      { value: "pet_care", icon: "🐾", label: "Pet Care" },
      { value: "tasks", icon: "🔧", label: "Tasks & Handyman" },
      { value: "packages", icon: "📦", label: "Package Delivery" },
      { value: "not_sure", icon: "✨", label: "Not sure yet" },
    ],
  },
  {
    id: 3,
    emoji: "📅",
    question: "When do you want to work?",
    subtitle: "This helps me match your schedule.",
    options: [
      { value: "on_demand", icon: "⚡", label: "Anytime (on-demand)" },
      { value: "set_schedule", icon: "🗓️", label: "Set schedule / routes" },
      { value: "weekends", icon: "🌅", label: "Weekends only" },
    ],
  },
  {
    id: 4,
    emoji: "💸",
    question: "How fast do you need to get paid?",
    subtitle: "Some platforms pay same-day, others weekly.",
    options: [
      { value: "same_day", icon: "⚡", label: "Same day — I need it fast" },
      { value: "weekly", icon: "📆", label: "Weekly is fine" },
    ],
  },
  {
    id: 5,
    emoji: "📍",
    question: "What's your city or ZIP code?",
    subtitle: "I'll show platforms available in your area.",
  },
];

const COOLDOWN_KEY = "gwt_gigsidekick_quiz_last_shown";
const COOLDOWN_DAYS = 30;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExitSurvey() {
  const [visible, setVisible] = useState(false);
  const [rideIn, setRideIn] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [step, setStep] = useState(1); // 1–5 = quiz, 6 = results
  const [answers, setAnswers] = useState<QuizAnswers>({
    vehicle: "",
    gigType: "",
    schedule: "",
    paySpeed: "",
    location: "",
  });
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const locationRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => (step === 6 ? matchPlatforms(answers) : []),
    [step, answers]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const allowedPaths = ["/", "/platforms"];
        const currentPath = window.location.pathname;
        if (!allowedPaths.includes(currentPath)) return;

        // Clear old survey key so returning users see the new quiz
        localStorage.removeItem('gwt_exit_survey_shown_session');
        const last = localStorage.getItem(COOLDOWN_KEY);
        if (last) {
          const daysSince =
            (Date.now() - parseInt(last, 10)) / (1000 * 60 * 60 * 24);
          if (daysSince < COOLDOWN_DAYS) return;
        }
        setVisible(true);
        localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
        setTimeout(() => setRideIn(true), 100);
        setTimeout(() => setShowCard(true), 1200);
      } catch {}
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Focus location input when we reach step 5
  useEffect(() => {
    if (step === 5) {
      setTimeout(() => locationRef.current?.focus(), 300);
    }
  }, [step]);

  const close = () => {
    setShowCard(false);
    setTimeout(() => setRideIn(false), 200);
    setTimeout(() => setVisible(false), 800);
  };

  const selectOption = (field: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => setStep((s) => s + 1), 300);
  };

  const submitLocation = () => {
    if (!answers.location.trim()) return;
    setStep(6);
  };

  const submitEmail = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          gig_type: answers.gigType,
          vehicle: answers.vehicle,
          location: answers.location,
          source: "gigsidekick_quiz",
        }),
      });
      setEmailSent(true);
    } catch {
      setEmailSent(true); // still show success UX
    }
    setSubmitting(false);
  };

  if (!visible) return null;

  const currentStep = STEPS[step - 1];
  const totalQuizSteps = 5;

  // ── Progress dots ────────────────────────────────────────────────────────────
  const dots = step <= totalQuizSteps && (
    <div className="flex justify-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
      {STEPS.map((s) => (
        <div
          key={s.id}
          className={`rounded-full transition-all duration-500 ${
            s.id === step
              ? "w-5 h-2 bg-gradient-to-r from-teal-400 to-[#00C9B1]"
              : s.id < step
              ? "w-2 h-2 bg-teal-300"
              : "w-2 h-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          rideIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* Container */}
      <div className="relative flex items-end">
        {/* Avatar — desktop only */}
        <div
          className="hidden sm:block flex-shrink-0 z-10"
          style={{
            transform: rideIn ? "translateX(0)" : "translateX(600px)",
            opacity: rideIn ? 1 : 0,
            transition:
              "transform 1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
          }}
        >
          <div
            className={
              rideIn
                ? "animate-[subtleBounce_2.5s_ease-in-out_infinite_1.5s]"
                : ""
            }
          >
            <img
              src="/gigsidekick-avatar.png"
              alt="GigSidekick"
              className="h-64 w-auto object-contain drop-shadow-2xl -mr-6 mb-1"
            />
          </div>
        </div>

        {/* Speech bubble card */}
        <div
          className="relative z-20"
          style={{
            transform: showCard
              ? "translateX(0) scale(1)"
              : "translateX(80px) scale(0.9)",
            opacity: showCard ? 1 : 0,
            transition:
              "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
          }}
        >
          {/* Bubble tail */}
          <div className="hidden sm:block absolute -left-2 bottom-12 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 z-0" />

          <div
            className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
            style={{ width: step === 6 ? 380 : 320 }}
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-[#00C9B1] to-orange-400" />

            <div className="p-5">
              {/* Close */}
              <button
                onClick={close}
                className="absolute top-3.5 right-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center text-xs transition-all"
              >
                ✕
              </button>

              {/* Mobile avatar */}
              <div className="sm:hidden flex justify-center mb-3">
                <img
                  src="/gigsidekick-avatar.png"
                  alt="GigSidekick"
                  className="h-20 w-auto object-contain drop-shadow-lg"
                />
              </div>

              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">
                  {step <= totalQuizSteps ? currentStep.emoji : "🎉"}
                </span>
                <p className="text-[10px] font-bold text-[#00C9B1] uppercase tracking-widest">
                  GigSidekick
                </p>
              </div>

              {/* ── Quiz steps 1–4: option buttons ── */}
              {step <= 4 && currentStep && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 leading-snug pr-5">
                    {currentStep.question}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {currentStep.subtitle}
                  </p>

                  {/* 2-col grid for step 2 (7 options), 1-col otherwise */}
                  <div
                    className={`gap-2 ${
                      step === 2
                        ? "grid grid-cols-2"
                        : "flex flex-col"
                    }`}
                  >
                    {currentStep.options!.map((opt) => {
                      const field = (
                        ["vehicle", "gigType", "schedule", "paySpeed"] as const
                      )[step - 1];
                      const selected = answers[field] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => selectOption(field, opt.value)}
                          className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                            selected
                              ? "bg-gradient-to-r from-teal-500 to-[#00C9B1] text-white border-transparent shadow-md shadow-teal-500/20"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#00C9B1] hover:bg-teal-50/50"
                          }`}
                        >
                          <span className="mr-1.5">{opt.icon}</span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {dots}
                </div>
              )}

              {/* ── Step 5: Location ── */}
              {step === 5 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 leading-snug pr-5">
                    {currentStep.question}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {currentStep.subtitle}
                  </p>
                  <input
                    ref={locationRef}
                    type="text"
                    value={answers.location}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitLocation();
                    }}
                    placeholder="e.g. Dallas, TX or 75201"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all bg-gray-50"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={() => setStep(6)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={submitLocation}
                      disabled={!answers.location.trim()}
                      className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-teal-500 to-[#00C9B1] text-white rounded-xl transition-all shadow-md disabled:opacity-40"
                    >
                      Find My Gigs →
                    </button>
                  </div>
                  {dots}
                </div>
              )}

              {/* ── Step 6: Results ── */}
              {step === 6 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 leading-snug pr-5">
                    {matches.length > 0
                      ? `I found ${matches.length} matching gig${matches.length === 1 ? "" : "s"} for you!`
                      : "Here are some popular gigs to explore"}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Based on your answers — tap any to learn more.
                  </p>

                  {/* Platform cards — show top 6, real total in heading */}
                  <div className="flex flex-col gap-2 mb-4 max-h-[220px] overflow-y-auto pr-0.5">
                    {(matches.length > 0
                      ? matches.slice(0, 6)
                      : (platformsData as any[])
                          .filter(
                            (p) =>
                              !inactiveStatuses.includes(
                                (p.driverStatus || "").toLowerCase()
                              )
                          )
                          .slice(0, 5)
                    ).map((p: any) => {
                      const logo = getPlatformLogo(p);
                      const pay =
                        p.estimatedHourlyMin && p.estimatedHourlyMax
                          ? `$${p.estimatedHourlyMin}–$${p.estimatedHourlyMax}/hr`
                          : null;
                      return (
                        <Link
                          key={p.id}
                          href={`/platforms/${p.slug || p.id}`}
                          onClick={close}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all group"
                        >
                          {logo ? (
                            <img
                              src={logo}
                              alt={p.name}
                              className="w-8 h-8 rounded object-contain bg-gray-50 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-600 flex-shrink-0">
                              {p.name?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {p.name}
                            </p>
                            {pay && (
                              <p className="text-xs text-teal-600 font-medium">
                                {pay} est.
                              </p>
                            )}
                          </div>
                          <span className="text-gray-300 group-hover:text-teal-400 transition-colors text-sm">
                            →
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* See all link */}
                  <Link
                    href={`/platforms${answers.location ? `?search=${encodeURIComponent(answers.location)}` : ""}`}
                    onClick={close}
                    className="block text-center text-xs text-teal-600 hover:text-teal-700 font-semibold mb-4 hover:underline"
                  >
                    {matches.length > 6 ? `See all ${matches.length} matching platforms →` : "Browse all platforms →"}
                  </Link>

                  {/* Email capture */}
                  <div className="border-t border-gray-100 pt-3">
                    {emailSent ? (
                      <p className="text-center text-xs font-semibold text-teal-600 py-1">
                        ✅ You're in! We'll send new gigs your way.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                          💌 Save your results — get notified when new gigs open in your area.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitEmail();
                            }}
                            placeholder="your@email.com"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none bg-gray-50"
                          />
                          <button
                            onClick={submitEmail}
                            disabled={submitting || !email.trim()}
                            className="px-3 py-2 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg transition-all disabled:opacity-40 whitespace-nowrap"
                          >
                            {submitting ? "..." : "Save →"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
