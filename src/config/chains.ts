import { monad, monadTestnet } from "viem/chains";

export { monad, monadTestnet };

/**
 * Chains supported by JPay.
 *
 * The first entry is the default chain used by wagmi and the Privy wallet.
 * Swap the order if you want Monad mainnet to be the default.
 */
export const supportedChains = [monadTestnet, monad] as const;

export const defaultChain = supportedChains[0];

export type SupportedChainId = (typeof supportedChains)[number]["id"];

export type NetworkMeta = {
  name: string;
  shortName: string;
  chainId: SupportedChainId;
  explorerUrl: string;
  isTestnet: boolean;
};

export const NETWORKS: Record<SupportedChainId, NetworkMeta> = {
  [monadTestnet.id]: {
    name: "Monad Testnet",
    shortName: "Testnet",
    chainId: monadTestnet.id,
    explorerUrl: "https://testnet.monadscan.com",
    isTestnet: true,
  },
  [monad.id]: {
    name: "Monad Mainnet",
    shortName: "Mainnet",
    chainId: monad.id,
    explorerUrl: "https://monadscan.com",
    isTestnet: false,
  },
};

export function getNetwork(chainId?: number): NetworkMeta {
  if (!chainId) return NETWORKS[defaultChain.id];

  return (NETWORKS as Record<number, NetworkMeta>)[chainId] ?? NETWORKS[defaultChain.id];
}

export function explorerTxUrl(hash: string, chainId?: number): string {
  return `${getNetwork(chainId).explorerUrl}/tx/${hash}`;
}

export function explorerAddressUrl(address: string, chainId?: number): string {
  return `${getNetwork(chainId).explorerUrl}/address/${address}`;
}
