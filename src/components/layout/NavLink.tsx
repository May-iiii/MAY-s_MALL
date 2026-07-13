"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  activeMatch?: string;
};

export function NavLink({ href, children, activeMatch }: Props) {
  const pathname = usePathname();
  const isActive = activeMatch
    ? pathname.startsWith(activeMatch)
    : pathname === href;

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive ? "text-primary" : "text-text-secondary"
      }`}
    >
      {children}
    </Link>
  );
}
