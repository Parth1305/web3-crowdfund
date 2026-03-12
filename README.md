# FundChain — Decentralized Crowdfunding dApp

> Trustless crowdfunding on Ethereum. Create campaigns, contribute ETH, and withdraw only when goals are met — all enforced by smart contract.

**Live Demo:** [parth1305.github.io/web3-crowdfund](https://parth1305.github.io/web3-crowdfund)  
**Contract:** [0x189ab20b1993166d1c498c5acafa396658d2fea5](https://sepolia.etherscan.io/address/0x189ab20b1993166d1c498c5acafa396658d2fea5) on Sepolia

---

## Overview

FundChain is a full-stack Web3 application that demonstrates end-to-end blockchain development — from a Solidity smart contract deployed on Ethereum Sepolia, to a Node.js/Express backend API, to a vanilla JS frontend.

No intermediaries. No trust required. The contract enforces all rules.

---

## How It Works

1. **Create a campaign** — set a title, ETH goal, and deadline
2. **Contribute ETH** — anyone can send ETH to an active campaign
3. **Withdraw** — owner can withdraw only if the goal is met before the deadline
4. **Refund** — contributors can claim refunds if the goal wasn't met

All logic lives on-chain. The backend is a read/write API layer over the contract.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.28, Hardhat v3 |
| Blockchain | Ethereum Sepolia Testnet |
| Backend | Node.js, Express, TypeScript, viem |
| Frontend | Vanilla HTML/CSS/JS |
| RPC | Alchemy |
| Deploy | GitHub Pages (frontend) |

---

## Project Structure

```
web3-crowdfund/
├── contracts/
│   └── Crowdfund.sol          # Solidity smart contract
├── test/
│   └── Crowdfund.test.ts      # 9 passing tests
├── scripts/
│   └── deploy.ts              # Hardhat deploy script
├── backend/
│   └── src/
│       ├── index.ts           # Express server (port 3001)
│       ├── contract.ts        # viem client + ABI
│       └── routes.ts          # API route handlers
├── frontend/
│   └── index.html             # Single-page frontend
└── hardhat.config.ts
```

---

## Smart Contract

**`contracts/Crowdfund.sol`**

```solidity
struct Campaign {
    address owner;
    string title;
    uint256 goal;
    uint256 deadline;
    uint256 amountRaised;
    bool withdrawn;
}
```

**Functions:**
- `createCampaign(title, goal, durationInDays)` — creates a new campaign
- `contribute(campaignId)` — send ETH to a campaign (payable)
- `withdraw(campaignId)` — owner withdraws if goal met
- `refund(campaignId)` — contributor claims refund if goal not met
- `getCampaign(campaignId)` — read campaign data

**Security:** Reentrancy protection via state updates before external calls.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List all campaigns |
| GET | `/api/campaigns/:id` | Get single campaign |
| POST | `/api/campaigns` | Create new campaign |
| POST | `/api/campaigns/:id/contribute` | Contribute ETH |

**Example — Create Campaign:**
```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"title": "My Campaign", "goalInEth": "0.05", "durationInDays": 30}'
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- An Alchemy account (free tier works)
- A funded Sepolia wallet

### 1. Clone the repo
```bash
git clone https://github.com/Parth1305/web3-crowdfund.git
cd web3-crowdfund
```

### 2. Install dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 3. Set environment variables
```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export SEPOLIA_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
export CROWDFUND_CONTRACT_ADDRESS="0x189ab20b1993166d1c498c5acafa396658d2fea5"
```

### 4. Run tests
```bash
npx hardhat test
# 9 passing
```

### 5. Start the backend
```bash
cd backend
npm run dev
# Server running on http://localhost:3001
```

### 6. Open the frontend
Open `frontend/index.html` in your browser.

---

## Deploying the Contract

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Update `CROWDFUND_CONTRACT_ADDRESS` and the address in `frontend/index.html` with the new contract address.

---

## Tests

```
✓ should create a campaign
✓ should allow contributions
✓ should allow owner to withdraw when goal is met
✓ should prevent withdrawal if goal not met
✓ should allow refund if goal not met after deadline
✓ should prevent refund if goal was met
✓ should prevent contributions after deadline
✓ should prevent double withdrawal
✓ should track multiple contributors
```

Run with:
```bash
npx hardhat test
```

---

## What I Learned

- Writing and deploying Solidity smart contracts with Hardhat v3
- Interacting with Ethereum using viem (TypeScript-first alternative to ethers.js)
- Building a REST API that reads/writes to a live blockchain
- Reentrancy attack patterns and how to prevent them
- Working with BigInt for on-chain numeric values
- Sepolia testnet deployment and Etherscan verification

---

## Author

**Parth Gohil**  
PGD in Backend & Blockchain Development — York University  
[GitHub](https://github.com/Parth1305)

---

*Built on Ethereum Sepolia · Not for production use*