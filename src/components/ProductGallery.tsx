"use client";

import { useState } from "react";

type ImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setLightboxIdx(idx)}
            className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:border-white/50 hover:scale-105 cursor-pointer"
          >
            <img
              src={img}
              alt={`${productName} ${idx + 1}`}
              className="h-full w-full object-contain p-1"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((lightboxIdx - 1 + images.length) % images.length);
              }}
              className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIdx]}
            alt={`${productName} ${lightboxIdx + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((lightboxIdx + 1) % images.length);
              }}
              className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-6 text-sm text-white/60">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}