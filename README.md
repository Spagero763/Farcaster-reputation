# Farcaster ReputationClaim Mini App

This mini app connects Farcaster and a verified ReputationClaim smart contract on Base Sepolia. Users verify their `castHash`, and if valid, they can claim onchain reputation.

## 💡 Features

- Verify Farcaster cast using Neynar API
- Call `claimReputation()` on Base Sepolia
- Wagmi + RainbowKit + Tailwind UI

## 🔧 Tech Stack

- Next.js (App Router)
- Tailwind CSS
- RainbowKit & Wagmi
- Neynar API
- Solidity (ReputationClaim.sol)

## 🔐 Smart Contract

- Name: `ReputationClaim`
- Address: `0x34272536B3c2fa0D21D63e451B490D0be56D26d0`
- Network: Base Sepolia

## 🧪 How It Works

1. User pastes `castHash`.
2. App fetches cast metadata via Neynar API.
3. If valid, the app allows user to claim onchain reputation.

## 🚀 Run Locally

Set your Neynar API Key in a `.env.local` file:
```
NEYNAR_API_KEY=your_neynar_api_key
```

Then run the development server:
```bash
npm install
npm run dev
```
