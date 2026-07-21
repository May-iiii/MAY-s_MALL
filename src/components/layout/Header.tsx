import Link from "next/link";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { CartBadge } from "./CartBadge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#f2eeeb]/80 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-2xl text-stone-800">
            MAY{"'"}s Mall
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink href="/products" activeMatch="/products">
            商品
          </NavLink>
          <CartBadge />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
