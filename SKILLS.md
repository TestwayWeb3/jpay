---
name: jpay-hackathon
description: Skill optimasi untuk membangun proyek hackathon di Monad dengan cepat, hemat token, dan fokus MVP. Sudah terintegrasi dengan MONSKILLS.
---

# JPay Hackathon Skill (Monad Blitz Optimized)

## Aturan Utama (WAJIB DIPATUHI)
- Selalu prioritaskan **MVP yang bisa demo** dalam waktu singkat.
- Jangan over-engineer. Hindari fitur yang tidak kritis untuk demo.
- Gunakan stack yang sudah ditentukan, jangan usulkan alternatif kecuali diminta.
- Jawaban harus padat, langsung kasih kode yang bisa dipakai.
- Hindari penjelasan panjang kecuali diminta.
- Setiap kali mulai task baru, cek dulu skill MONSKILLS yang relevan.

## Stack Wajib untuk Proyek Ini
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Wallet: Privy
- Blockchain: wagmi v2 + viem
- Smart Contract: Solidity (sederhana & gas efficient)
- Chain: Monad Testnet (utama) & Mainnet
- QR Code: qrcode.react
- Hosting: Vercel
- Warna utama: #6E54FF

## Alur Kerja (Ikuti Urutan Ini)
1. Setup project (Next.js + Privy + wagmi + Monad)
2. Buat & deploy Smart Contract sederhana
3. Halaman Merchant: Buat Pembayaran + Generate QR
4. Halaman Customer: /pay/[paymentId] + proses pembayaran
5. Dashboard sederhana + status update
6. Polish UI & testing

## Integrasi MONSKILLS
Selalu mulai dengan skill routing `monskill` jika tersedia.
Gunakan skill berikut sesuai kebutuhan:
- `scaffold` → saat buat project dari nol
- `wallet-integration` → saat setup Privy / wallet
- `addresses` → saat butuh contract address di Monad
- `concepts` → jika ada issue terkait karakteristik Monad
- `wallet` → untuk agent wallet / deploy
- `gas` → optimasi gas

## Prinsip Coding Hackathon
- Utamakan kecepatan development & kejelasan demo
- Smart contract seminimal mungkin (createPayment + pay + getPayment)
- UI harus bersih dan mobile-friendly
- Selalu handle loading, error, dan success state
- Gunakan TypeScript dengan baik, tapi jangan terlalu strict sampai memperlambat
- Hindari library berat yang tidak perlu

## Format Jawaban yang Diharapkan
- Langsung berikan kode lengkap yang bisa di-copy
- Sertakan nama file dengan jelas
- Jika ada beberapa file, keluarkan satu per satu secara terurut
- Berikan perintah terminal yang dibutuhkan
- Setelah selesai satu langkah, tanyakan apakah siap lanjut ke langkah berikutnya

## Konteks Proyek Saat Ini
Proyek: **JPay** (Just Pay with Monad)
Deskripsi: Sistem pembayaran QR berbasis Monad agar wisatawan & user Web3 bisa bayar di Jogja menggunakan USDC/MON secara langsung.

Fokus MVP:
- Merchant buat pembayaran → generate QR
- Customer scan & bayar
- Status berubah jadi Paid