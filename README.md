# VoteSafe — Blockchain Based Voting System

**VoteSafe** is a decentralized, transparent, and tamper-proof voting application developed as a mini-project for the **Blockchain & DLT (BCDLT)** course at **SFIT (St. Francis Institute of Technology)**.

## Team (Group 4)
* Kruti Bagwe (13)
* Tanmay Bhatkar (14)
* Styris Dcruz (15)
* Anish Kalbhor (16)
* **Guide:** Ms. Shraddha Sandimani

## Tech Stack
* **Smart Contract:** Solidity ^0.8.0
* **Development Framework:** Hardhat 2.22.17
* **Frontend:** Next.js 14 (Pages Router)
* **Blockchain Bridge:** Ethers.js 6.4.0
* **Wallet:** MetaMask

## Key Features
* **Phased Election Control:** Registration, Voting, and Results phases managed by Admin.
* **Voter Authentication:** Authorization using name and Aadhar (last 4 digits) verification.
* **Double-Vote Prevention:** Cryptographic enforcement at the smart contract level.
* **Voter Simulation Panel:** Demonstrate multiple votes locally without switching MetaMask accounts.
* **Live Results:** Real-time bar chart updates and winner declaration.

## Quick Setup
1. `nvm use 20.18.0`
2. Start local node: `npx hardhat node`
3. Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`
4. Run Frontend: `cd frontend && npm run dev`

## Public Deployment
* **Network:** Sepolia Testnet
* **Contract Address:** `0xC93b12B43F353E8382C9A103c033d3D49324d9EA`