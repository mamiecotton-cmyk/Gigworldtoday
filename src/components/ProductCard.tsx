import Link from "next/link";
import { ProductRecord } from "@/lib/products";

type ProductCardProps = {
  product: ProductRecord;
  detailsHref?: string;
};

export default function ProductCard({ product, detailsHref }: ProductCardProps) {
  const href = detailsHref ?? `/products/${product.slug}`;
  const primaryImage = (product.images && product.images.length ? product.images[0] : product.image) || "/city-background.jpg";

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={primaryImage}
        alt={product.name}
        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-sm leading-relaxed text-gray-600">{product.short_description}</p>
        <Link
          href={href}
          className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
