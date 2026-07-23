import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  slug: string; name: string; price: number;
  comparePrice: number | null; image: string | null;
  stock: number; category: string;
};

export function ProductCard({
  slug, name, price, comparePrice, image, stock, category,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[4/3] bg-surface-secondary overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Discount badge */}
          {comparePrice != null && comparePrice > price && (
            <div className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              {Math.round((1 - price / comparePrice) * 100)}% OFF
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-text-muted">{category}</p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold text-text-primary leading-snug min-h-[2.75em]">
            {name}
          </h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-text-primary">
              {formatPrice(price)}
            </span>
            {comparePrice != null && comparePrice > price && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
          {stock <= 0 && (
            <p className="mt-2 text-xs font-medium text-text-muted">暂时缺货</p>
          )}
        </div>
      </div>
    </Link>
  );
}
