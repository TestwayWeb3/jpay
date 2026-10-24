import { readFile } from "node:fs/promises";
import path from "node:path";

import { ethers, network } from "hardhat";

import type { JPayPaymentContract } from "../types/jpay-payment";

/**
 * Contoh pemakaian contract setelah deploy.
 *
 *   npx hardhat run scripts/create-payment.ts --network monadTestnet
 *
 * Atau isi JPAY_PAYMENT_ADDRESS di contracts/.env supaya script tidak
 * bergantung pada file deployments terbaru.
 */
async function main() {
  const envAddress = process.env.JPAY_PAYMENT_ADDRESS?.trim();
  const address = envAddress || (await getDeployedAddress(network.name));

  const [merchant] = await ethers.getSigners();
  const jpay = (await ethers.getContractAt(
    "JPayPayment",
    address,
  )) as unknown as JPayPaymentContract;

  const amount = ethers.parseEther(process.env.PAYMENT_AMOUNT ?? "1");
  const description = process.env.PAYMENT_DESCRIPTION ?? "Kopi Susu - Kedai Jogja";

  console.log(`Contract : ${address}`);
  console.log(`Merchant : ${merchant.address}`);

  const tx = await jpay.createPayment(amount, description);
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Transaksi tidak menghasilkan receipt.");

  const created = receipt.logs
    .map((log) => {
      try {
        return jpay.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((event) => event?.name === "PaymentCreated");

  const paymentId = created?.args.paymentId as bigint | undefined;
  if (paymentId === undefined) {
    throw new Error("PaymentCreated event tidak ditemukan di receipt.");
  }

  const payment = await jpay.getPayment(paymentId);

  console.log("");
  console.log(`paymentId : ${paymentId}`);
  console.log(`amount    : ${ethers.formatEther(payment.amount)} MON`);
  console.log(`status    : ${payment.isPaid ? "paid" : "pending"}`);
  console.log(`qr target : /pay/${paymentId.toString()}`);
}

async function getDeployedAddress(networkName: string): Promise<string> {
  const file = path.join(__dirname, "..", "deployments", `${networkName}.json`);

  try {
    const raw = await readFile(file, "utf8");
    const address = (JSON.parse(raw) as { address?: string }).address;
    if (address) return address;
  } catch {
    // Fall through ke error yang lebih jelas di bawah.
  }

  throw new Error(
    `Deployment untuk network "${networkName}" belum ada. Jalankan deploy dulu atau set JPAY_PAYMENT_ADDRESS.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
