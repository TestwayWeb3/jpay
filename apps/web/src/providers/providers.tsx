"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { SetupNotice } from "@/components/setup-notice";
import { defaultChain, supportedChains } from "@/config/chains";
import { wagmiConfig } from "@/lib/wagmi";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // Without an App ID Privy cannot mount, so show setup instructions instead
  // of crashing the whole app. Get one at https://dashboard.privy.io
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <SetupNotice />
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#6E54FF",
          logo: "/jpay-mark.svg?v=2",
          landingHeader: "Welcome to JPay",
          loginMessage: "Just Pay with Monad",
          walletList: [
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "wallet_connect",
          ],
        },
        loginMethods: ["email", "google", "wallet"],
        defaultChain,
        supportedChains: [...supportedChains],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
