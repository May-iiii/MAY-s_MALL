"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    return `/products?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <Link
        href={buildUrl(currentPage - 1)}
        className={`rounded-lg px-3 py-2 text-sm ${
          currentPage <= 1
            ? "pointer-events-none text-text-muted"
            : "text-text-secondary hover:bg-surface-secondary"
        }`}
      >
        上一页
      </Link>
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              page === currentPage
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            {page}
          </Link>
        ),
      )}
      <Link
        href={buildUrl(currentPage + 1)}
        className={`rounded-lg px-3 py-2 text-sm ${
          currentPage >= totalPages
            ? "pointer-events-none text-text-muted"
            : "text-text-secondary hover:bg-surface-secondary"
        }`}
      >
        下一页
      </Link>
    </div>
  );
}
