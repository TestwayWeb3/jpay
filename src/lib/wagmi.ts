import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";

import { monad, monadTestnet, supportedChains } from "@/config/chains";

/**
 * RPC URLs can be overridden with env vars so you can point JPay at
 * a dedicated provider (Alchemy, QuickNode, Ankr, ...) in production.
 */
const mainnetRpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL || undefined;
const testnetRpcUrl = process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL || undefined;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [monad.id]: http(mainnetRpcUrl),
    [monadTestnet.id]: http(testnetRpcUrl),
  },
  ssr: true,
});
