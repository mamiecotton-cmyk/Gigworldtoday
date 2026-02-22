"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StarRating({
  platformSlug,
}: {
  platformSlug: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    fetchAverage();
  }, []);

  const fetchAverage = async () => {
    const { data } = await supabase
      .from("ratings")
      .select("rating")
      .eq("platform_slug", platformSlug);

    if (data && data.length > 0) {
      const avg =
        data.reduce((sum, r) => sum + r.rating, 0) /
        data.length;

      setAverage(avg);
      setCount(data.length);
    } else {
      setAverage(null);
      setCount(0);
    }
  };

  const submitRating = async (rating: number) => {
    if (!user) {
      alert("Please log in to rate.");
      return;
    }

    setLoading(true);
    setSelected(rating);

    await supabase.from("ratings").upsert({
      user_id: user.id,
      platform_slug: platformSlug,
      rating,
    });

    await fetchAverage();
    setLoading(false);
  };

  return (
    <div className="mt-6 border-t pt-4">
      {/* Score Display */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            DriverScore
          </p>
          {average ? (
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold text-black">
                {average.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                / 5 ({count} ratings)
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No ratings yet
            </p>
          )}
        </div>
      </div>

      {/* Star Buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => submitRating(star)}
            disabled={loading}
            className={`text-xl transition-colors ${
              selected && star <= selected
                ? "text-yellow-500"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {!user && (
        <p className="text-xs text-gray-400 mt-2">
          Log in to submit your rating.
        </p>
      )}
    </div>
  );
}
