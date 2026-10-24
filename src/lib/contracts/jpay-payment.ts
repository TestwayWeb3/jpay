import {
  BaseError,
  ContractFunctionRevertedError,
  isAddress,
  parseAbi,
  type Address,
} from "viem";

import { toUserMessage } from "@/lib/format";

/** ABI minimal JPayPayment — hanya fungsi & event yang dipakai frontend. */
export const jpayPaymentAbi = parseAbi([
  "function createPayment(uint256 amount, string description) returns (uint256 paymentId)",
  "function pay(uint256 paymentId) payable",
  "function getPayment(uint256 paymentId) view returns ((address merchant, uint256 amount, string description, bool isPaid, address payer, uint40 createdAt))",
  "function paymentCount() view returns (uint256)",
  "event PaymentCreated(uint256 indexed paymentId, address indexed merchant, uint256 amount, string description, uint40 createdAt)",
  "event PaymentPaid(uint256 indexed paymentId, address indexed merchant, address indexed payer, uint256 amount)",
  "error InvalidAmount()",
  "error DescriptionTooLong()",
  "error PaymentNotFound()",
  "error AlreadyPaid()",
  "error IncorrectAmount(uint256 expected, uint256 received)",
  "error MerchantCannotPay()",
  "error TransferFailed()",
]);

/** Sama dengan MAX_DESCRIPTION_LENGTH di kontrak. */
export const JPAY_MAX_DESCRIPTION_LENGTH = 200;

const envAddress = process.env.NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS?.trim();

/** Null kalau env belum diisi / formatnya bukan address valid. */
export const jpayPaymentAddress: Address | null =
  envAddress && isAddress(envAddress) ? envAddress : null;

export type JPayPayment = {
  merchant: Address;
  amount: bigint;
  description: string;
  isPaid: boolean;
  payer: Address;
  /** uint40 di-decode viem sebagai number (detik Unix). */
  createdAt: number;
};

const REVERT_MESSAGES: Record<string, string> = {
  InvalidAmount: "Enter an amount greater than zero.",
  DescriptionTooLong: `Keep the description under ${JPAY_MAX_DESCRIPTION_LENGTH} characters.`,
  PaymentNotFound: "That payment no longer exists on this network.",
  AlreadyPaid: "This payment has already been paid.",
  IncorrectAmount: "The amount sent does not match the invoice.",
  MerchantCannotPay: "You cannot pay your own invoice. Use a customer wallet.",
  TransferFailed: "The transfer to the merchant failed. Please try again.",
};

/** Nama custom error kontrak (mis. "PaymentNotFound"), kalau ada. */
export function getContractRevertName(error: unknown): string | null {
  if (!(error instanceof BaseError)) return null;

  const revert = error.walk(
    (item) => item instanceof ContractFunctionRevertedError,
  ) as ContractFunctionRevertedError | null;

  return revert?.data?.errorName ?? null;
}

/** Terjemahkan revert kontrak / error wallet jadi pesan yang bisa dibaca. */
export function describePaymentError(error: unknown): string | null {
  if (!error) return null;

  const name = getContractRevertName(error);
  if (name && REVERT_MESSAGES[name]) return REVERT_MESSAGES[name];

  return toUserMessage(error);
}
