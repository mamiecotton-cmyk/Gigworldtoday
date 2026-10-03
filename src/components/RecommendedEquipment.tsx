"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Platform } from "@/lib/types";

type Equipment = NonNullable<Platform["recommendedEquipment"]>;

export default function RecommendedEquipment({ items }: { items: Equipment }) {
  const [images, setImages] = useState<Record<string, string>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImages({});
    setFailedImages({});
    const slugs = [...new Set(items.flatMap((item) => item.productSlug ? [item.productSlug] : []))];
    if (!slugs.length) return;

    async function loadImages() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("slug, image, images")
          .in("slug", slugs)
          .eq("published", true);
        if (cancelled || error) return;

        const previews: Record<string, string> = {};
        for (const product of data || []) {
          const candidates: string[] = product.images?.length ? product.images : [product.image];
          const image = candidates.find((url) => url && !/amazon\.com|media-amazon\.com|ssl-images-amazon/i.test(url));
          if (image) previews[product.slug] = image;
        }
        setImages(previews);
      } catch {
        // Equipment links remain usable if previews cannot be loaded.
      }
    }

    void loadImages();
    return () => { cancelled = true; };
  }, [items]);

  return (
    <div className="space-y-2 text-sm">
      {items.map((item, idx) => {
        const slug = item.productSlug;
        if (!slug) return <div key={idx} className="text-gray-700">{item.label}</div>;
        const image = images[slug];
        return (
          <div key={idx} className="group relative w-fit max-w-full">
            <Link
              href={`/products/${slug}`}
              className="block font-medium text-[#00C9B1] hover:underline focus-visible:underline"
              onMouseEnter={() => setDismissed(null)}
              onFocus={() => setDismissed(null)}
              onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) => { if (event.key === "Escape") setDismissed(slug); }}
            >
              {item.label}
            </Link>
            {image && !failedImages[slug] && dismissed !== slug && (
              <div className="invisible absolute left-0 top-full z-30 w-48 max-w-[calc(100vw-4rem)] pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                  <img
                    src={image}
                    alt={`${item.label} product preview`}
                    className="h-40 w-full object-contain"
                    onError={() => setFailedImages((previous) => ({ ...previous, [slug]: true }))}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
