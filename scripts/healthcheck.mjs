/**
 * Demo preflight: verifies the JPay contract is reachable on Monad Testnet.
 *
 * Usage: npm run check:chain
 * Reads NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS from apps/web/.env.local
 * (or the shell env) in the monorepo.
 */
import { existsSync, readFileSync } from "node:fs";
import { createPublicClient, http, parseAbi } from "viem";
import { monadTestnet } from "viem/chains";

const FALLBACK_ADDRESS = "0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a";
const ENV_CANDIDATES = ["apps/web/.env.local", ".env.local"];

function readLocalEnv(key) {
  for (const file of ENV_CANDIDATES) {
    if (!existsSync(file)) continue;

    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match?.[1] === key) return match[2].replace(/^["']|["']$/g, "").trim();
    }
  }

  return undefined;
}

const address =
  process.env.NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS?.trim() ||
  readLocalEnv("NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS") ||
  FALLBACK_ADDRESS;

const rpcUrl =
  process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL?.trim() ||
  readLocalEnv("NEXT_PUBLIC_MONAD_TESTNET_RPC_URL") ||
  undefined;

const abi = parseAbi([
  "function paymentCount() view returns (uint256)",
  "function getPayment(uint256 paymentId) view returns ((address merchant, uint256 amount, string description, bool isPaid, address payer, uint40 createdAt))",
]);

const client = createPublicClient({
  chain: monadTestnet,
  transport: http(rpcUrl),
});

console.log(`JPay preflight · ${monadTestnet.name}`);
console.log(`RPC      ${rpcUrl ?? "https://testnet-rpc.monad.xyz"}`);
console.log(`Contract ${address}`);

try {
  const code = await client.getCode({ address });

  if (!code || code === "0x") {
    console.error(
      "\n✖ No bytecode at this address. It is probably an EOA (deployer wallet), not the JPayPayment contract.",
    );
    process.exit(1);
  }

  console.log(`Bytecode ${Math.floor((code.length - 2) / 2)} bytes ✓`);

  const count = await client.readContract({
    address,
    abi,
    functionName: "paymentCount",
  });

  console.log(`Invoices ${count}`);

  if (count > 0n) {
    const payment = await client.readContract({
      address,
      abi,
      functionName: "getPayment",
      args: [count],
    });

    const created = new Date(Number(payment.createdAt) * 1000).toISOString();
    console.log(
      `Latest   #${count} · ${payment.isPaid ? "PAID" : "UNPAID"} · ${payment.description || "(no description)"} · ${created}`,
    );
  }

  console.log("\n✓ Ready to demo.");
} catch (error) {
  console.error("\n✖ Preflight failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
