import "dotenv/config";

import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY?.trim();
const accounts = PRIVATE_KEY
  ? [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`]
  : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        // 200 cukup untuk kontrak kecil seperti ini; hindari runs besar
        // karena biaya deploy ikut naik.
        runs: 200,
      },
      // Monad kompatibel dengan Shanghai/Cancun. Shanghai menghindari opcode
      // Cancun (MCOPY/TSTORE) yang tidak dibutuhkan kontrak ini.
      evmVersion: "shanghai",
    },
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts,
    },
    monad: {
      url: process.env.MONAD_RPC_URL || "https://rpc.monad.xyz",
      chainId: 143,
      accounts,
    },
  },
};

export default config;
