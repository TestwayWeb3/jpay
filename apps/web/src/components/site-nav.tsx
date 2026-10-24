"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/merchant", label: "Merchant" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/demo", label: "Demo" },
];

export function SiteNav({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        "items-center gap-1",
        variant === "desktop" ? "hidden sm:flex" : "flex sm:hidden",
      )}
    >
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg text-xs font-medium transition",
              variant === "desktop" ? "px-2.5 py-1.5" : "flex-1 px-3 py-2 text-center",
              active
                ? "border border-monad-500/30 bg-monad-500/15 text-monad-200"
                : "border border-transparent text-muted hover:bg-white/[0.06] hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
