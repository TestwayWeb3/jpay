import assert from "node:assert/strict";

import { ethers } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

import type { JPayPaymentContract } from "../types/jpay-payment";

describe("JPayPayment", () => {
  async function deployFixture() {
    const [merchant, customer, stranger] = await ethers.getSigners();
    const deployed = await (await ethers.getContractFactory("JPayPayment")).deploy();
    await deployed.waitForDeployment();

    const jpay = deployed as unknown as JPayPaymentContract;

    return { jpay, merchant, customer, stranger };
  }

  it("creates a payment and emits PaymentCreated", async () => {
    const { jpay, merchant } = await deployFixture();
    const amount = ethers.parseEther("1.5");

    const args = await expectEvent(
      jpay,
      jpay.createPayment(amount, "Kopi Susu"),
      "PaymentCreated",
    );

    assert.equal(args.paymentId, 1n);
    assert.equal(args.merchant, merchant.address);
    assert.equal(args.amount, amount);
    assert.equal(args.description, "Kopi Susu");

    assert.equal(await jpay.paymentCount(), 1n);

    const payment = await jpay.getPayment(1);
    assert.equal(payment.merchant, merchant.address);
    assert.equal(payment.amount, amount);
    assert.equal(payment.description, "Kopi Susu");
    assert.equal(payment.isPaid, false);
    assert.equal(payment.payer, ethers.ZeroAddress);
    assert.ok(payment.createdAt > 0n);
  });

  it("increments paymentId for every invoice", async () => {
    const { jpay } = await deployFixture();

    await jpay.createPayment(1n, "first");
    await jpay.createPayment(2n, "second");

    assert.equal(await jpay.paymentCount(), 2n);
    assert.equal((await jpay.getPayment(2)).description, "second");
  });

  it("pays an invoice and forwards MON to the merchant", async () => {
    const { jpay, merchant, customer } = await deployFixture();
    const amount = ethers.parseEther("2");

    await jpay.createPayment(amount, "Nasi Gudeg");

    const merchantBefore = await ethers.provider.getBalance(merchant.address);

    const args = await expectEvent(
      jpay,
      jpay.connect(customer).pay(1, { value: amount }),
      "PaymentPaid",
    );

    assert.equal(args.paymentId, 1n);
    assert.equal(args.merchant, merchant.address);
    assert.equal(args.payer, customer.address);
    assert.equal(args.amount, amount);

    const merchantAfter = await ethers.provider.getBalance(merchant.address);
    assert.equal(merchantAfter - merchantBefore, amount);

    const payment = await jpay.getPayment(1);
    assert.equal(payment.isPaid, true);
    assert.equal(payment.payer, customer.address);
  });

  it("rejects paying with the wrong amount", async () => {
    const { jpay, customer } = await deployFixture();
    await jpay.createPayment(ethers.parseEther("1"), "Teh");

    await assert.rejects(
      jpay.connect(customer).pay(1, { value: ethers.parseEther("0.5") }),
      /IncorrectAmount/,
    );
  });

  it("rejects double payment", async () => {
    const { jpay, customer } = await deployFixture();
    await jpay.createPayment(1n, "Double");
    await jpay.connect(customer).pay(1, { value: 1n });

    await assert.rejects(
      jpay.connect(customer).pay(1, { value: 1n }),
      /AlreadyPaid/,
    );
  });

  it("rejects merchant paying their own invoice", async () => {
    const { jpay, merchant } = await deployFixture();
    await jpay.createPayment(1n, "Self");

    await assert.rejects(
      jpay.connect(merchant).pay(1, { value: 1n }),
      /MerchantCannotPay/,
    );
  });

  it("rejects unknown payment ids", async () => {
    const { jpay, customer } = await deployFixture();

    await assert.rejects(jpay.getPayment(42), /PaymentNotFound/);
    await assert.rejects(
      jpay.connect(customer).pay(42, { value: 1n }),
      /PaymentNotFound/,
    );
  });

  it("rejects zero amount and overlong descriptions", async () => {
    const { jpay } = await deployFixture();

    await assert.rejects(jpay.createPayment(0n, "free"), /InvalidAmount/);
    await assert.rejects(
      jpay.createPayment(1n, "x".repeat(201)),
      /DescriptionTooLong/,
    );
  });
});

/** Assert a tx emits the given event once and return its parsed args. */
async function expectEvent(
  contract: JPayPaymentContract,
  txPromise: Promise<ContractTransactionResponse>,
  eventName: string,
) {
  const tx = await txPromise;
  const receipt = await tx.wait();
  assert.ok(receipt);

  const events = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter((event) => event?.name === eventName);

  assert.equal(events.length, 1, `expected one ${eventName} event`);
  return events[0]!.args;
}
