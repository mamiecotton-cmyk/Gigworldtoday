"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductRecord } from "@/lib/products";

type Props = {
  product: ProductRecord;
};

export default function ProductGallery({ product }: Props) {
  const images = product.images && product.images.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div>
      <div className="w-full rounded-lg overflow-hidden">
        <img src={activeImage} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {images.map((img) => (
          <button
            key={img}
            onClick={() => setActiveImage(img)}
            className={`rounded-lg overflow-hidden border ${img === activeImage ? 'ring-2 ring-teal-400' : ''}`}
          >
            <img src={img} className="h-20 w-full object-cover" alt="thumbnail" />
          </button>
        ))}
      </div>
    </div>
  );
}
