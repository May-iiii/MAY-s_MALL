"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

type Props = {
  categories: Category[];
};

export function CategoryFilter({ categories }: Props) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const buildUrl = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    return `/products?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildUrl("")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-primary text-white"
            : "bg-surface-secondary text-text-secondary hover:bg-surface hover:text-primary"
        }`}
      >
        全部
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildUrl(cat.slug)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === cat.slug
              ? "bg-primary text-white"
              : "bg-surface-secondary text-text-secondary hover:bg-surface hover:text-primary"
          }`}
        >
          {cat.name}
          <span className="ml-1 opacity-70">({cat.productCount})</span>
        </Link>
      ))}
    </div>
  );
}
