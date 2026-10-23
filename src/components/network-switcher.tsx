"use client";

import { useAccount, useSwitchChain } from "wagmi";

import { ChevronDownIcon } from "@/components/icons";
import { getNetwork, supportedChains } from "@/config/chains";
import { cn } from "@/lib/cn";

export function NetworkSwitcher({ className }: { className?: string }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const active = getNetwork(chain?.id);

  return (
    <div className={cn("relative", className)} title={isConnected ? "Switch network" : "Connect a wallet to switch network"}>
      <span
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
          active.isTestnet ? "bg-amber-400" : "bg-emerald-400",
        )}
      />
      <select
        aria-label="Select network"
        value={active.chainId}
        disabled={!isConnected || isPending}
        onChange={(event) => {
          const next = supportedChains.find((item) => item.id === Number(event.target.value));
          if (next && next.id !== active.chainId) {
            switchChain({ chainId: next.id });
          }
        }}
        className="appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-7 pr-8 text-xs font-medium text-foreground outline-none transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {supportedChains.map((item) => (
          <option key={item.id} value={item.id} className="bg-[#0d0b16] text-foreground">
            {getNetwork(item.id).name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
    </div>
  );
}
