# JPayPayment — Smart Contract

Kontrak invoice pembayaran untuk JPay, di-deploy di **Monad** (native MON).
Alurnya sederhana: merchant membuat invoice → customer scan QR → `pay(paymentId)` →
dana langsung masuk ke merchant, status invoice menjadi `Paid`.

## Struktur

```
packages/contracts/
├── contracts/JPayPayment.sol     # kontrak utama
├── scripts/deploy.ts             # deploy + tulis deployments/<network>.json
├── scripts/create-payment.ts     # contoh pembuatan invoice (demo)
├── test/JPayPayment.ts           # 8 test
├── types/jpay-payment.ts         # tipe minimal untuk script/test
├── hardhat.config.ts             # Monad Testnet (10143) + Mainnet (143)
├── deployments/                  # hasil deploy (address + ABI), dibuat otomatis
└── .env.example
```

Package ini adalah workspace `@jpay/contracts`. Dari root repo, gunakan
`npm run contracts:compile`, `npm run contracts:test`, dan
`npm run contracts:deploy:testnet`.

## Ringkasan kontrak

| Item | Detail |
| --- | --- |
| `createPayment(amount, description)` | Merchant membuat invoice, return `paymentId` (mulai dari 1) |
| `pay(paymentId)` | Customer bayar tepat `amount` wei; MON langsung dikirim ke merchant |
| `getPayment(paymentId)` | Baca detail invoice (revert `PaymentNotFound` jika tidak ada) |
| `paymentCount()` | Jumlah invoice = ID terakhir |
| Events | `PaymentCreated`, `PaymentPaid` |
| Batas deskripsi | 200 byte |
| Gas deploy | ±497.535 |
| Gas `createPayment` | ±136.723 |
| Gas `pay` | ±42.721 |

Pengamanan yang sudah ada:

- Amount harus > 0 dan `msg.value` harus **tepat** sama dengan `amount` (tidak ada overpay/underpay).
- Invoice tidak bisa dibayar dua kali (`AlreadyPaid`).
- Merchant tidak bisa membayar invoice-nya sendiri (`MerchantCannotPay`).
- Pola checks-effects-interactions sebelum transfer, jadi aman dari reentrancy invoice yang sama.
- Tanpa owner, tanpa upgrade, tanpa custody — dana mengalir langsung customer → merchant.
- Custom error (bukan string revert) untuk hemat gas.

> Catatan: versi ini memakai **native MON**. Pembayaran USDC/ERC20 bisa ditambah
> sebagai kontrak terpisah di iterasi berikutnya.

## Deploy ke Monad Testnet

### 1. Install dependency

Dari root repo (npm workspaces):

```powershell
npm install
```

Atau langsung di package ini:

```powershell
cd packages/contracts
npm install
```

### 2. Siapkan private key deployer

```powershell
Copy-Item .env.example .env
```

Edit `packages/contracts/.env`:

```ini
DEPLOYER_PRIVATE_KEY=0x.....
```

Gunakan wallet khusus deploy (bukan wallet utama). File `.env` sudah di-gitignore.

### 3. Ambil MON testnet

Buka <https://faucet.monad.xyz>, paste address deployer, minta MON.
Cek saldo: <https://testnet.monadscan.com/address/0x...>

### 4. Compile + test

```powershell
npm run compile
npm run test
```

### 5. Deploy

```powershell
npm run deploy:testnet
```

Output contoh:

```
Network   : monadTestnet (chainId 10143)
Deployer  : 0xabc...
Balance   : 12.5 MON
JPayPayment deployed: 0x1234...abcd
Deployment file     : packages/contracts/deployments/monadTestnet.json

Tambahkan ke apps/web/.env.local:
NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS=0x1234...abcd
```

### 6. Hubungkan ke frontend

Tambahkan baris di `apps/web/.env.local`:

```ini
NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS=0x1234...abcd
```

Address + ABI lengkap juga tersimpan di `packages/contracts/deployments/monadTestnet.json`
(kunci `address` dan `abi`) untuk dipakai wagmi/viem di frontend.

### 7. (Opsional) Buat invoice demo dari terminal

```powershell
npm run create-payment:testnet
```

Atur nominal/label lewat `PAYMENT_AMOUNT` dan `PAYMENT_DESCRIPTION` di `.env`.

### Mainnet

Isi `MONAD_RPC_URL` (opsional) lalu:

```powershell
npm run deploy:mainnet
```

## Parameter jaringan

| | Testnet | Mainnet |
| --- | --- | --- |
| Chain ID | 10143 | 143 |
| RPC | https://testnet-rpc.monad.xyz | https://rpc.monad.xyz |
| Explorer | https://testnet.monadscan.com | https://monadscan.com |
| Faucet | https://faucet.monad.xyz | — |

## Contoh pemakaian setelah deploy

### ethers (script / backend)

```ts
import { ethers } from "ethers";
import deployment from "./deployments/monadTestnet.json";

const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
const jpay = new ethers.Contract(deployment.address, deployment.abi, provider);

// Merchant membuat invoice 5 MON
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
const tx = await jpay.connect(signer).createPayment(
  ethers.parseEther("5"),
  "Nasi Gudeg - Warung Bu Tini",
);
await tx.wait();

const payment = await jpay.getPayment(1);
console.log(payment.amount, payment.description, payment.isPaid);
```

### viem (dipakai di frontend nanti)

```ts
import { createPublicClient, http, parseEther } from "viem";
import { monadTestnet } from "viem/chains";

const client = createPublicClient({ chain: monadTestnet, transport: http() });

// Baca invoice berdasarkan paymentId dari URL /pay/[paymentId]
const payment = await client.readContract({
  address: process.env.NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS as `0x${string}`,
  abi: JPAY_PAYMENT_ABI,
  functionName: "getPayment",
  args: [1n],
});

// Customer bayar
await walletClient.writeContract({
  address: process.env.NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS as `0x${string}`,
  abi: JPAY_PAYMENT_ABI,
  functionName: "pay",
  args: [1n],
  value: payment.amount,
  gas: 60_000n, // Monad menagih berdasarkan gas limit
});
```

### Payload QR

Cukup encode paymentId di URL, contoh:

```
https://jpay.vercel.app/pay/1
```

Halaman `/pay/[paymentId]` lalu memanggil `getPayment(1)`, menampilkan nominal +
deskripsi, dan tombol bayar memanggil `pay(1, { value: amount })`.

## Verifikasi kontrak

Kontrak yang dipakai saat ini **belum terverifikasi** di Sourcify/Monadscan.
Panduan langkah demi langkah (UI explorer + opsi Hardhat) ada di
[`docs/VERIFY.md`](../../docs/VERIFY.md).

Parameter yang harus sama persis saat verifikasi: compiler `v0.8.28`, optimizer
enabled dengan `runs: 200`, dan `evmVersion: shanghai`.
