import type {
  ContractRunner,
  ContractTransactionResponse,
  Interface,
} from "ethers";

/** Bentuk struct Payment yang dikembalikan `getPayment`. */
export type Payment = {
  merchant: string;
  amount: bigint;
  description: string;
  isPaid: boolean;
  payer: string;
  createdAt: bigint;
};

/**
 * Tipe minimal JPayPayment tanpa codegen TypeChain.
 * Cukup untuk script Hardhat dan test; frontend memakai ABI dari deployment JSON.
 */
export interface JPayPaymentContract {
  interface: Interface;
  connect(runner: ContractRunner): JPayPaymentContract;
  waitForDeployment(): Promise<JPayPaymentContract>;
  getAddress(): Promise<string>;
  deploymentTransaction(): ContractTransactionResponse | null;
  createPayment(
    amount: bigint,
    description: string,
  ): Promise<ContractTransactionResponse>;
  pay(
    paymentId: bigint | number,
    overrides?: { value: bigint },
  ): Promise<ContractTransactionResponse>;
  getPayment(paymentId: bigint | number): Promise<Payment>;
  paymentCount(): Promise<bigint>;
}
