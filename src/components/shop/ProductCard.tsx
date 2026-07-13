import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  comparePrice: number | null;
  image: string | null;
  stock: number;
  category: string;
};

export function ProductCard({
  slug,
  name,
  price,
  comparePrice,
  image,
  stock,
  category,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="card overflow-hidden p-0 transition-shadow hover:shadow-md">
        <div className="aspect-square bg-surface-secondary">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-text-muted">{category}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-text-primary">{name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-danger">{formatPrice(price)}</span>
            {comparePrice != null && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
          {stock <= 0 && (
            <p className="mt-2 text-xs text-text-muted">暂时缺货</p>
          )}
        </div>
      </div>
    </Link>
  );
}
