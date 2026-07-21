"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  ProductsIcon,
  OrdersIcon,
  CategoriesIcon,
  UsersIcon,
} from "./icons";

type Props = { email: string };

const links = [
  { href: "/admin", label: "概览", Icon: DashboardIcon },
  { href: "/admin/products", label: "商品管理", Icon: ProductsIcon },
  { href: "/admin/orders", label: "订单管理", Icon: OrdersIcon },
  { href: "/admin/categories", label: "分类管理", Icon: CategoriesIcon },
  { href: "/admin/users", label: "用户管理", Icon: UsersIcon },
];

export function AdminSidebar({ email }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex w-60 flex-col bg-stone-900 text-stone-300">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl text-white"
        >
          MAY{"'"}s Mall
        </Link>
      </div>

      <div className="px-6 pb-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-stone-500">
          控制台
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {links.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-500" />
              )}
              <Icon
                className={`h-5 w-5 transition-colors ${
                  active ? "text-amber-500" : "text-stone-500 group-hover:text-stone-300"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone-800 p-4">
        <p className="truncate text-xs text-stone-400">{email}</p>
        <Link
          href="/"
          className="mt-1.5 inline-block text-xs text-stone-500 transition-colors hover:text-amber-500"
        >
          ← 返回前台
        </Link>
      </div>
    </aside>
  );
}
