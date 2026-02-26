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
    <article className={`relative group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${compact ? 'min-h-0' : ''}`}>
      {/* Decorative accents behind content */}
      <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-1 ${compact ? 'opacity-80' : 'opacity-60'} bg-gradient-to-b from-teal-400 to-transparent`} />
      <div className={`pointer-events-none absolute -top-6 -right-6 rounded-full ${compact ? 'w-16 h-16' : 'w-28 h-28'} bg-gradient-to-br from-teal-300 to-teal-500 opacity-20 blur-lg`} />

      <div className={`w-full ${compact ? 'aspect-square' : 'aspect-[4/3]'} overflow-hidden bg-gray-50 flex items-center justify-center p-3 relative z-10`}>
        <img
          src={primaryImage}
          alt={product.name}
          className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02] ${compact ? '' : ''}`}
        />
      </div>
      <div className={`${compact ? 'space-y-2 p-3' : 'space-y-4 p-6'} relative z-10`}>
        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-gray-900`}>{product.name}</h3>
        <p className={`text-sm text-gray-600 ${compact ? 'max-h-10 overflow-hidden' : 'leading-relaxed'}`}>{product.short_description}</p>
        <Link
          href={href}
          className={`inline-flex items-center rounded-xl bg-gray-900 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-semibold text-white transition-colors hover:bg-gray-700`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
