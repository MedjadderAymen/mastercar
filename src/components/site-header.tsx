"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function SiteHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          AutoParts <span className="text-blue-600">Hub</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-blue-600">
            Shop by brand
          </Link>
          <Link href="/cart" className="relative flex items-center gap-1 hover:text-blue-600">
            Cart
            {totalItems > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
