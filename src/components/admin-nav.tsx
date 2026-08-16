"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/accessories", label: "Accessories & stock" },
  { href: "/admin/brands", label: "Brands & models" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-blue-600 text-white" : "text-black/70 hover:bg-black/5"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
