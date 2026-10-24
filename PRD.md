# JPay — Product Requirements Document

---

## 1. Title & Document Metadata

| Field | Detail |
|---|---|
| **Project Name** | JPay |
| **Tagline** | *Just Pay with Monad* |
| **Version** | v0.2 (QRIS + Loyalty Token) |
| **Date** | October 24, 2026 |
| **Status** | 🟢 Hackathon MVP (Monad Blitz) |
| **Target Event** | Monad Blitz — Yogyakarta |
| **Network** | Monad Testnet (MVP) → Mainnet (Vision) |

> **Document Purpose**  
> PRD ini mendefinisikan JPay sebagai jembatan Web3-to-QRIS + sistem loyalty token on-chain. Dirancang agar bisa dibangun dalam waktu terbatas hackathon sambil tetap memiliki diferensiasi kuat.

---

## 2. Executive Summary & Value Proposition

**JPay** memungkinkan siapa saja yang punya crypto (MON / USDC) di wallet untuk **membayar merchant QRIS biasa** di Indonesia (terutama Jogja) tanpa merchant perlu mengubah apa pun.

Ditambah fitur diferensiasi:
> Setiap kali customer berhasil bayar, sistem otomatis **mint Loyalty Token** (JPoint) ke wallet customer. Token ini bisa dikumpulkan dan ditukar diskon di merchant yang bergabung.

### Value Proposition

**Untuk Customer (Web3 User / Turis / Mahasiswa):**
- Bayar pakai crypto di mana saja yang ada QRIS
- Dapat loyalty token otomatis setiap transaksi
- Self-custodial sampai detik terakhir

**Untuk Merchant:**
- Tidak perlu onboard atau ganti QR
- Tetap terima Rupiah (via mock settlement di MVP)
- Mendapatkan customer Web3 + sistem loyalty otomatis

**Core Insight:**  
JPay tidak memaksa merchant masuk ke Web3. Justru Web3 yang menyesuaikan diri dengan infrastruktur QRIS yang sudah dipakai 30+ juta merchant.

---

## 3. Problem Statement

- Crypto holder di Jogja kesulitan belanja sehari-hari.
- Merchant lokal tidak mau ribet dengan crypto.
- Solusi payment crypto yang ada biasanya meminta merchant ganti sistem.
- Belum ada yang menggabungkan **pembayaran QRIS + loyalty token on-chain** secara mulus.

---

## 4. Solution Overview

1. Customer buka JPay → Connect Wallet (Privy)
2. Scan QRIS merchant yang sudah ada
3. App parse QRIS (EMVCo) → dapat NMID, nama merchant, nominal IDR
4. Tampilkan konversi real-time ke MON/USDC
5. Customer konfirmasi & bayar di Monad
6. Smart contract:
   - Menerima pembayaran
   - Emit event PaymentExecuted
   - **Mint Loyalty Token (JPoint)** ke payer
7. Backend mock settlement → merchant “terima” IDR
8. Customer dapat receipt + loyalty points

---

## 5. Key Features (MVP)

### Must Have
- Privy Auth (email / social / wallet)
- Camera QRIS Scanner + EMVCo Parser
- Price Oracle (IDR → MON / USDC)
- Smart Contract `JPayGateway.sol` + `JPoint.sol` (Loyalty Token)
- Automatic minting JPoint saat pembayaran sukses
- Mock IDR Settlement
- Digital Receipt (tampilkan juga JPoint yang didapat)
- Basic Loyalty Balance viewer

### Nice to Have (jika waktu cukup)
- Redeem JPoint jadi diskon
- NFT Receipt
- Simple merchant dashboard (lihat total JPoint yang sudah di-mint)

---

## 6. Loyalty Token Specification (JPoint)

| Item | Detail |
|---|---|
| **Name** | JPoint |
| **Symbol** | JPT |
| **Standard** | ERC-20 |
| **Decimals** | 18 |
| **Minting Rule** | 1 JPoint per Rp1.000 yang dibayar (bisa disesuaikan) |
| **Mint Authority** | Hanya `JPayGateway` contract |
| **Transferable** | Ya (MVP) |
| **Utility MVP** | Ditampilkan di receipt + halaman balance |

---

## 7. Technical Stack

- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind
- Wallet: Privy
- Web3: wagmi v2 + viem
- Smart Contract: Solidity 0.8.28 (JPayGateway + JPoint)
- QR: html5-qrcode + custom EMVCo parser
- Hosting: Vercel
- Skill: `jpay-hackathon` (wajib digunakan di OpenCode)

---

## 8. Success Metrics (Hackathon)

- Full flow berjalan: Scan QRIS → Bayar → Dapat JPoint → Receipt
- Transaksi < 3 detik (Monad advantage)
- Juri langsung paham diferensiasi “Pay + Earn Loyalty Token”
- Demo stabil (0 failed tx saat presentasi)

---

## 9. Out of Scope (MVP)

- Real bank/PJSP settlement
- Full KYC
- Multi-chain
- Advanced redeem system
- Native mobile app

---

## 10. Skill yang Wajib Digunakan

Gunakan skill **jpay-hackathon** di OpenCode.  
Skill ini sudah mencakup:
- Aturan hemat token
- Stack wajib
- Integrasi MONSKILLS
- Fokus MVP hackathon
- Konteks JPay + Loyalty Token

---

*End of PRD v0.2*