"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAccount, useBalance } from "wagmi";

import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  LogoutIcon,
  WalletIcon,
} from "@/components/icons";
import { explorerAddressUrl, getNetwork } from "@/config/chains";
import { cn } from "@/lib/cn";
import { formatMon, shortenAddress } from "@/lib/format";

export function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address, chain } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!authenticated) setOpen(false);
  }, [authenticated]);

  async function handleCopy() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked by the browser; nothing to do here.
    }
  }

  async function handleDisconnect() {
    setOpen(false);
    await logout();
  }

  if (!ready) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
    );
  }

  if (!authenticated) {
    return (
      <button type="button" onClick={() => login()} className="btn-primary h-9">
        <WalletIcon className="h-4 w-4" />
        Connect Wallet
      </button>
    );
  }

  const network = getNetwork(chain?.id);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-monad-400 to-monad-700 text-[11px] font-bold text-white">
          {address ? address.slice(2, 4).toUpperCase() : <WalletIcon className="h-4 w-4" />}
        </span>
        <span className="hidden font-mono text-xs text-foreground sm:inline">
          {shortenAddress(address)}
        </span>
        <ChevronDownIcon
          className={cn("h-3.5 w-3.5 text-muted transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b16]/95 p-2 shadow-card backdrop-blur-xl"
        >
          <div className="rounded-xl bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                Connected wallet
              </span>
              <span className="pill !py-0.5 !text-[10px]">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    network.isTestnet ? "bg-amber-400" : "bg-emerald-400",
                  )}
                />
                {network.shortName}
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-foreground">
              {address ? `${address.slice(0, 10)}…${address.slice(-6)}` : "Setting up wallet…"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatMon(balance?.value)}{" "}
              <span className="text-xs font-medium text-muted">
                {balance?.symbol ?? "MON"}
              </span>
            </p>
          </div>

          <div className="mt-1.5 space-y-0.5">
            <button type="button" onClick={handleCopy} className="menu-item" role="menuitem">
              {copied ? (
                <CheckIcon className="h-4 w-4 text-emerald-400" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              {copied ? "Address copied" : "Copy address"}
            </button>

            {address ? (
              <Link
                href={explorerAddressUrl(address, chain?.id)}
                target="_blank"
                rel="noreferrer"
                className="menu-item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <ExternalLinkIcon className="h-4 w-4" />
                View on explorer
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleDisconnect}
              className="menu-item text-rose-300 hover:!bg-rose-500/10 hover:!text-rose-200"
              role="menuitem"
            >
              <LogoutIcon className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
