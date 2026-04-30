"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import PlatformSetup from "@/components/earnings/PlatformSetup";
import DailyLogger from "@/components/earnings/DailyLogger";
import EarningsDashboard from "@/components/earnings/EarningsDashboard";

export default function EarningsPage() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userPlatforms, setUserPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<"log" | "dashboard">("log");
  const [refreshKey, setRefreshKey] = useState(0);
  const [deeplink, setDeeplink] = useState<{ platform_name: string; date: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      console.log("SESSION:", session);

      if (!session) {
        router.push("/register?redirectTo=/dashboard/earnings");
        return;
      }

      // Verify token is still valid server-side
      const { data: { user: verifiedUser } } = await supabase.auth.getUser();
      if (!verifiedUser) {
        await supabase.auth.signOut();
        router.push("/register?redirectTo=/dashboard/earnings");
        return;
      }

      setUser(session.user);
      setAccessToken(session.access_token);

      const { data: platforms } = await supabase
        .from("user_platforms")
        .select("*")
        .eq("user_id", session.user.id)
        .order("display_order");

      if (!platforms || platforms.length === 0) {
        setNeedsSetup(true);
      } else {
        setUserPlatforms(platforms);
      }
      setLoading(false);
    };

    load();
  }, []);

  const handleSetupComplete = async () => {
    // Re-fetch platforms so DailyLogger has them immediately without a page refresh
    if (user?.id) {
      const { data: platforms } = await supabase
        .from("user_platforms")
        .select("*")
        .eq("user_id", user.id)
        .order("display_order");
      if (platforms) setUserPlatforms(platforms);
    }
    setNeedsSetup(false);
  };

  const reloadPlatforms = useCallback(async () => {
    if (!user?.id) return;
    const { data: platforms } = await supabase
      .from("user_platforms")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order");
    if (platforms) setUserPlatforms(platforms);
  }, [user?.id]);

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
    setActiveTab("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/60">Loading your earnings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirecting — keep showing the loader
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/60">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return <PlatformSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0f3460] px-4 pt-8 pb-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/gigsidekick-avatar.png"
              alt="GigSidekick"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                GigWorldToday
              </p>
              <h1 className="text-xl font-bold text-white">Earnings Tracker</h1>
            </div>
          </div>
          <p className="text-white/50 text-sm ml-13">
            Track your daily gig income across all platforms
          </p>
        </div>
      </div>

      {/* Content card */}
      <div className="max-w-lg mx-auto px-4 -mt-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("log")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                activeTab === "log"
                  ? "text-[#00C9B1] border-b-2 border-[#00C9B1]"
                  : "text-gray-400"
              }`}
            >
              📝 Log Earnings
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                activeTab === "dashboard"
                  ? "text-[#00C9B1] border-b-2 border-[#00C9B1]"
                  : "text-gray-400"
              }`}
            >
              📊 Dashboard
            </button>
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === "log" ? (
              <DailyLogger
                userPlatforms={userPlatforms}
                onSaved={handleSaved}
                onPlatformsChanged={reloadPlatforms}
                userId={user?.id}
                accessToken={accessToken || undefined}
                onOpenInDashboard={(platform_name, date) => {
                  setDeeplink({ platform_name, date });
                  setActiveTab("dashboard");
                }}
              />
            ) : (
              <EarningsDashboard
                key={refreshKey}
                deeplink={deeplink}
                onDeeplinkConsumed={() => setDeeplink(null)}
              />
            )}
          </div>
        </div>

        {/* Manage platforms link */}
        <div className="text-center mt-4 mb-8">
          <button
            onClick={() => setNeedsSetup(true)}
            className="text-xs text-gray-400 hover:text-teal-500 transition-colors"
          >
            + Manage my platforms
          </button>
        </div>
      </div>
    </div>
  );
}
