import Link from "next/link";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { JPayMark } from "@/components/jpay-mark";
import { NetworkSwitcher } from "@/components/network-switcher";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07060d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <JPayMark className="h-8 w-8 shrink-0" />
          <span className="text-[15px] font-semibold tracking-tight">JPay</span>
          <span className="hidden truncate text-xs text-muted sm:inline">
            Just Pay with Monad
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NetworkSwitcher />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
