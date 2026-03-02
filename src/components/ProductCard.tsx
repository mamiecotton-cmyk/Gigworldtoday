import Link from "next/link";
import { ProductRecord } from "@/lib/products";

type ProductCardProps = {
  product: ProductRecord;
  detailsHref?: string;
  compact?: boolean;
};

export default function ProductCard({ product, detailsHref }: ProductCardProps) {
  const href = detailsHref ?? `/products/${product.slug}`;
  const compact = (arguments[0] as any)?.compact ?? false;
  const primaryImage = (product.images && product.images.length ? product.images[0] : product.image) || "/city-background.jpg";

  return (
    <article className={`relative group overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-orange-50/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal-300 ${compact ? 'min-h-0' : ''}`}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-orange-400" />

      {/* Featured badge */}
      {product.featured && (
        <div className="absolute top-3 right-3 z-20 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
          ⭐ Featured
        </div>
      )}

      {/* Image area */}
      <div className={`w-full overflow-hidden bg-white/60 flex items-center justify-center ${compact ? 'p-2' : 'p-3'} relative z-10`}>
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105 ${compact ? 'max-h-[140px]' : 'max-h-[220px]'}`}
        />
      </div>

      {/* Content area */}
      <div className={`${compact ? 'space-y-1.5 p-3' : 'space-y-4 p-6'} relative z-10`}>
        {/* Price badge */}
        <div className="flex items-center justify-between">
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-gray-900`}>{product.name}</h3>
          {product.price && (
            <span className={`${compact ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} font-bold text-teal-700 bg-teal-100 rounded-full border border-teal-200`}>
              {product.price}
            </span>
          )}
        </div>
        <p className={`text-sm text-gray-600 ${compact ? 'max-h-10 overflow-hidden' : 'leading-relaxed'}`}>{product.short_description}</p>
        <Link
          href={href}
          className={`inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-semibold text-white transition-all hover:from-teal-600 hover:to-teal-700 hover:shadow-md`}
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}