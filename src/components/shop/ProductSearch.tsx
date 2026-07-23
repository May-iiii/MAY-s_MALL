"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  const doSearch = () => {
    const term = value.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/products?${query}` : "/products");
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索商品..."
        className="input-field w-full pr-16"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
        {isPending && (
          <span className="flex h-7 w-7 items-center justify-center">
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          </span>
        )}
        <button
          type="button"
          onClick={doSearch}
          disabled={isPending}
          className="flex h-7 w-8 items-center justify-center rounded-md text-stone-400 transition-colors hover:text-stone-700 hover:bg-stone-100"
          aria-label="搜索"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
