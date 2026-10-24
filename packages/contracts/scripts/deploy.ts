import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { artifacts, ethers, network } from "hardhat";

import type { JPayPaymentContract } from "../types/jpay-payment";

async function main() {
  const signers = await ethers.getSigners();

  if (signers.length === 0) {
    throw new Error(
      "Tidak ada deployer. Isi DEPLOYER_PRIVATE_KEY di packages/contracts/.env lalu jalankan ulang.",
    );
  }

  const [deployer] = signers;
  const balance = await ethers.provider.getBalance(deployer.address);
  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  console.log(`Network   : ${network.name} (chainId ${chainId})`);
  console.log(`Deployer  : ${deployer.address}`);
  console.log(`Balance   : ${ethers.formatEther(balance)} MON`);

  if (balance === 0n) {
    throw new Error("Saldo deployer 0 MON. Ambil faucet di https://faucet.monad.xyz");
  }

  const factory = await ethers.getContractFactory("JPayPayment");
  const contract = (await factory.deploy()) as unknown as JPayPaymentContract;
  const deploymentTx = contract.deploymentTransaction();

  console.log(`Deploying JPayPayment...`);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const receipt = await deploymentTx?.wait();
  const artifact = await artifacts.readArtifact("JPayPayment");

  const deployment = {
    contract: "JPayPayment",
    network: network.name,
    chainId,
    address,
    deployer: deployer.address,
    transactionHash: receipt?.hash ?? deploymentTx?.hash ?? null,
    blockNumber: receipt?.blockNumber ?? null,
    deployedAt: new Date().toISOString(),
    sourceName: artifact.sourceName,
    abi: artifact.abi,
  };

  const outDir = path.join(__dirname, "..", "deployments");
  const outFile = path.join(outDir, `${network.name}.json`);
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, `${JSON.stringify(deployment, null, 2)}\n`, "utf8");

  console.log("");
  console.log(`JPayPayment deployed: ${address}`);
  console.log(`Deployment file     : packages/contracts/deployments/${network.name}.json`);
  console.log("");
  console.log("Tambahkan ke apps/web/.env.local:");
  console.log(`NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
