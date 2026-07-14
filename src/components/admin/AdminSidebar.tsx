"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { email: string };

export function AdminSidebar({ email }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "概览", icon: "📊" },
    { href: "/admin/products", label: "商品管理", icon: "📦" },
    { href: "/admin/orders", label: "订单管理", icon: "📋" },
    { href: "/admin/categories", label: "分类管理", icon: "🏷️" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="text-lg font-bold text-primary">
          MAY{"'"}s Mall
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(link.href)
                ? "bg-primary-light text-primary"
                : "text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <Link href="/" className="text-xs text-text-muted hover:text-primary">
          返回前台
        </Link>
        <p className="mt-1 text-xs text-text-muted truncate">{email}</p>
      </div>
    </aside>
  );
}
