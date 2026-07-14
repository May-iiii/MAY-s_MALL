import Link from "next/link";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">MAY{"'"}s Mall</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink href="/products" activeMatch="/products">
            商品
          </NavLink>
          <NavLink href="/cart">购物车</NavLink>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
