# VoteSafe — Blockchain Based Voting System

A decentralized, transparent, and tamper-proof voting DApp built on Ethereum. Votes are recorded permanently on the blockchain — no central authority, no tampering, no double voting.

Live demo frontend: [vote-safe-blockchain.vercel.app](https://vote-safe-blockchain.vercel.app)  
Sepolia contract: [0xC93b12B43F353E8382C9A103c033d3D49324d9EA](https://sepolia.etherscan.io/address/0xC93b12B43F353E8382C9A103c033d3D49324d9EA)

---

## What This Project Does

VoteSafe runs a complete election lifecycle on the Ethereum blockchain:

- Admin registers candidates and authorizes voters
- Voters cast votes — each vote is a signed blockchain transaction
- Results are tallied and a winner is declared automatically by the smart contract
- Every action is publicly verifiable and immutable

No database. No backend server. The smart contract IS the backend.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Smart Contract | Solidity | ^0.8.0 |
| Dev Framework | Hardhat | 2.22.17 |
| Frontend | Next.js (Pages Router) | 14 |
| Blockchain Bridge | Ethers.js | 6.4.0 |
| Wallet | MetaMask | Browser Extension |
| Local Blockchain | Hardhat Node | Chain ID 31337 |
| Public Testnet | Sepolia (Ethereum) | Chain ID 11155111 |
| Runtime | Node.js | v20.18.0 |

---

## Features

- **Phased Election Control** — Registration, Voting, and Ended phases enforced at smart contract level. Functions revert if called in the wrong phase.
- **Voter Authorization** — Admin whitelists voters with name, ID verification (last 4 digits), and wallet address before voting begins.
- **Double Vote Prevention** — `mapping(address => bool) hasVoted` enforced inside the contract. Impossible to bypass from the frontend.
- **Voter Simulation Panel** — Simulate up to 7 voters casting votes without switching MetaMask accounts. Uses Hardhat's deterministic test wallets loaded via Ethers.js.
- **Live Results** — Real-time bar chart pulled directly from blockchain state. Updates after every confirmed vote.
- **Winner Declaration** — Automatically calculated by `getWinner()` after election ends. No manual tallying.
- **Merkle Tree Visualizer** — Visual representation of vote transaction hashing. Shows how each vote becomes a leaf node and how the Merkle root changes with every new transaction.
- **Voting Phase Timer** — Countdown timer for the active voting phase. Displays remaining time to voters and admin.
- **Sepolia Deployment** — Smart contract deployed on Sepolia public testnet. Verifiable on Etherscan.

---

## Project Structure

```
VoteSafe-Blockchain/
├── contracts/
│   └── Voting.sol              ← Smart contract (phases, candidates, voters, winner)
├── scripts/
│   └── deploy.js               ← Deployment script
├── artifacts/contracts/Voting.sol/
│   └── Voting.json             ← Auto-generated ABI after compile
├── frontend/
│   ├── contracts/
│   │   ├── Voting.json         ← Copy of ABI (update after contract changes)
│   │   └── config.js           ← CONTRACT_ADDRESS + NETWORK_CHAIN_ID
│   ├── hooks/
│   │   └── useVoting.js        ← All blockchain interactions via Ethers.js
│   ├── pages/
│   │   └── index.js            ← Full UI — Voter Booth, Live Results, Admin Panel tabs
│   └── styles/
│       └── globals.css
├── hardhat.config.js
└── package.json
```

---

## Smart Contract — Key Functions

```solidity
// Admin only
addCandidate(string name, string party)           // Registration phase only
authorizeVoter(address voter, string name, string id)  // Any phase
startVoting()                                     // Registration → Voting (needs 2+ candidates, 1+ voter)
endVoting()                                       // Voting → Ended

// Voter
castVote(uint256 candidateId)                     // Voting phase only, once per address

// View (anyone)
getCandidate(uint256 id)
getVoterStatus(address voter)
getResults()
getPhase()
getWinner()                                       // Only after Ended
```

**Anti-double-vote:**
```solidity
mapping(address => Voter) private voters;
require(!voters[msg.sender].voted, "Already voted.");
```
Enforced inside the EVM. No frontend code can bypass this.

---

## Local Setup

### Prerequisites

- Node.js v20.x (use [nvm](https://github.com/coreybutler/nvm-windows) on Windows)
- MetaMask browser extension
- Git

### Installation

```bash
git clone https://github.com/styris12/VoteSafe-Blockchain.git
cd VoteSafe-Blockchain

# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running Locally

**Terminal 1 — Start local blockchain:**
```bash
nvm use 20.18.0
npx hardhat node
```
Leave this running. Never close it during a session.

**Terminal 2 — Deploy contract:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copy the contract address printed in the output.

**Update contract address:**  
Open `frontend/contracts/config.js` and paste the new address:
```js
export const CONTRACT_ADDRESS = "PASTE_ADDRESS_HERE";
export const NETWORK_CHAIN_ID = 31337;
```

**Terminal 2 — Start frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### MetaMask Setup

Add Hardhat local network to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Hardhat Local |
| RPC URL | http://127.0.0.1:8545 |
| Chain ID | 31337 |
| Currency Symbol | ETH |

Import the admin account using this private key (Hardhat default test account — no real funds):
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Demo Walkthrough

### Phase 1 — Registration
1. Connect MetaMask as admin → Admin Panel tab appears
2. Add 3–4 candidates with name and party
3. Authorize voters — enter name, ID digits, select wallet from dropdown
4. Click **Start Voting Phase**

### Phase 2 — Voting
1. Go to **Voter Booth** tab → open **Voter Simulation**
2. Select a voter, verify identity, cast vote
3. Each vote generates a transaction hash visible in terminal
4. Repeat for all voters

### Phase 3 — Results
1. **Live Results** tab shows real-time bar chart
2. Admin clicks **End Election**
3. Winner banner appears — declared by smart contract

### Bonus — Double Vote Demo
Try voting as the same voter twice. Contract rejects with:  
`"Already voted."` — enforced at EVM level, not frontend.

---

## Debugging

### `no matching fragment` error
ABI mismatch between frontend and contract. Fix:
```bash
npx hardhat compile
```
Then copy `artifacts/contracts/Voting.sol/Voting.json` → replace `frontend/contracts/Voting.json`. Restart `npm run dev`.

### `could not decode result data (value="0x")`
Contract address is stale. The Hardhat node was restarted but `config.js` still has the old address. Redeploy and update `CONTRACT_ADDRESS` in `config.js`.

### MetaMask nonce errors / wrong transaction count
Happens when Hardhat node restarts. Fix:  
MetaMask → Settings → Advanced → **Reset Account** (do for each account used).

### Page not scrollable / Cast Vote button cut off
In `index.js`, ensure the outer page style uses `minHeight` not `height`:
```js
const page = { minHeight: '100vh', ... }
```
In `globals.css`, ensure `overflow-y: auto` on `html` and `body`.

### `<unrecognized-selector>` in Hardhat terminal
A frontend function call doesn't match any function in the ABI. Usually from a third-party integration or component calling a non-existent contract method. Cosmetic — doesn't affect core functionality.

---

## Deployment

### Sepolia Testnet

Contract is deployed at:  
`0xC93b12B43F353E8382C9A103c033d3D49324d9EA`  
[View on Etherscan](https://sepolia.etherscan.io/address/0xC93b12B43F353E8382C9A103c033d3D49324d9EA)

To deploy your own instance to Sepolia:
1. Create a `.env` file in the root:
```
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_wallet_private_key
```
2. Run:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Vercel (Frontend)

Frontend is deployed at [vote-safe-blockchain.vercel.app](https://vote-safe-blockchain.vercel.app).  
Connects to MetaMask — works with any network MetaMask is configured to.

---

## Known Limitations

- **MetaMask required** — voters need a browser wallet to interact
- **ID verification is a proof of concept** — last 4 digits are manually entered, no real government API integration
- **Local demo only** — Hardhat node runs on localhost; multi-device voting requires Sepolia or another public network
- **No voter anonymity** — wallet addresses are pseudonymous, not fully anonymous (zk-SNARKs would be needed for full privacy)
- **Gas fees** — on public networks, each vote costs a small transaction fee

---

## Future Scope

- Real identity verification via UIDAI Aadhar OTP API
- zk-SNARKs for complete voter anonymity
- Layer 2 deployment (Polygon, Arbitrum) for near-zero gas fees
- Voter self-registration with admin approval flow
- Time-locked voting phases using `block.timestamp`
- Mobile-friendly UI

---

## License

MIT