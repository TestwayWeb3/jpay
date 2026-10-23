import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.tagline}.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link href={siteConfig.links.monad} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Monad
          </Link>
          <Link href={siteConfig.links.docs} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Docs
          </Link>
          <Link href={siteConfig.links.faucet} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Testnet faucet
          </Link>
        </div>
      </div>
    </footer>
  );
}
