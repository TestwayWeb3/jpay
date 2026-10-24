// Next 14 tries to patch npm lockfiles when it cannot see every optional SWC
// binary. In an npm workspace on Windows that patch can fail even though the
// platform binary is installed and the build succeeds. Skip the non-fatal,
// noisy patch attempt.
process.env.NEXT_IGNORE_INCORRECT_LOCKFILE = "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // MetaMask SDK optionally requires React Native storage. It is never used
    // in the browser, so resolve it to an empty module instead of warning.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };

    // ox (pulled in by viem/chains) contains a dynamic require used only by the
    // Tempo chain. It is harmless for Monad; silence the misleading warning.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /ox[\\/]_esm[\\/]tempo[\\/]internal[\\/]virtualMasterPool/,
        message: /Critical dependency/,
      },
    ];

    return config;
  },
};

export default nextConfig;
