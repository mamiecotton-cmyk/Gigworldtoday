"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductRecord } from "@/lib/products";

type Props = {
  product: ProductRecord;
};

export default function ProductGallery({ product }: Props) {
  const images = product.images && product.images.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  return (
    <div>
      <div className="w-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block w-full"
          aria-label="Open image"
        >
          <img
            src={activeImage}
            alt={product.name}
            className="max-h-[200px] sm:max-h-[260px] md:max-h-[320px] lg:max-h-[380px] w-auto max-w-full object-contain rounded-lg"
          />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {images.map((img) => (
          <button
            key={img}
            onClick={() => setActiveImage(img)}
            className={`rounded-lg overflow-hidden border ${img === activeImage ? 'ring-2 ring-teal-400' : ''}`}
          >
            <img src={img} className="h-20 w-20 object-cover" alt="thumbnail" />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setLightboxOpen(false)}
          />

          <div className="relative mx-4 max-h-[90vh] max-w-[96vw]">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 text-gray-800 hover:bg-white"
              aria-label="Close"
            >
              ×
            </button>

            <div className="flex items-center justify-center">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[90vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-auto px-2">
                {images.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`rounded-md border ${img === activeImage ? 'ring-2 ring-teal-400' : ''}`}
                  >
                    <img src={img} className="h-16 w-16 object-cover" alt="thumb" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
