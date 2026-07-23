"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimisticCategory, setOptimisticCategory] = useState(searchParams.get("category") || "");

  // 同步外部 URL 变化（浏览器前进/后退）
  useEffect(() => {
    setOptimisticCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const handleClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    const query = params.toString();
    const url = query ? `/products?${query}` : "/products";

    // 立即更新高亮状态，不等待导航完成
    setOptimisticCategory(slug);

    startTransition(() => {
      router.push(url);
    });
  };

  const activeCategory = optimisticCategory;

  const baseClass =
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
  const activeClass = "bg-primary text-white";
  const inactiveClass =
    "bg-surface-secondary text-text-secondary hover:bg-surface hover:text-primary";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleClick("")}
        disabled={isPending}
        className={`${baseClass} ${
          !activeCategory ? activeClass : inactiveClass
        }`}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleClick(cat.slug)}
          disabled={isPending}
          className={`${baseClass} ${
            activeCategory === cat.slug ? activeClass : inactiveClass
          }`}
        >
          {cat.name}
          <span className="ml-1 opacity-70">({cat.productCount})</span>
        </button>
      ))}
    </div>
  );
}
