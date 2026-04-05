# Hardhat Blockchain Setup Guide

## Overview
Successfully integrated Hardhat development environment into the food supply chain blockchain project. The setup enables smart contract compilation, deployment, and testing.

## Files Created

### 1. Configuration Files

#### [package.json](file:///Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/food-supply-blokchain/backend/blockchain/package.json)
- Dependencies: `hardhat`, `@nomicfoundation/hardhat-toolbox`
- Scripts: compile, deploy, node, test

#### [hardhat.config.cjs](file:///Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/food-supply-blokchain/backend/blockchain/hardhat.config.cjs)
- Solidity version: 0.8.0
- Network: localhost (127.0.0.1:8545)
- Configured paths for contracts, artifacts, cache

#### [.gitignore](file:///Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/food-supply-blokchain/backend/blockchain/.gitignore)
- Excludes: node_modules, artifacts, cache, coverage

### 2. Deployment Script

#### [scripts/deploy.js](file:///Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/food-supply-blokchain/backend/blockchain/scripts/deploy.js)
- Deploys FoodSupplyChain contract
- Logs contract address and deployment details
- Error handling included

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend/blockchain
npm install
```

### 2. Compile Smart Contract
```bash
npm run compile
```

This compiles `Blockchain.sol` and generates artifacts in the `artifacts/` directory.

### 3. Start Local Blockchain
```bash
npm run node
```

This starts a local Hardhat network on `http://127.0.0.1:8545` with test accounts.

### 4. Deploy Contract (in new terminal)
```bash
npm run deploy
```

This deploys the FoodSupplyChain contract and logs the contract address.

## Usage Examples

### Compile Contract
```bash
cd backend/blockchain
npm run compile
```

### Run Local Node
```bash
npm run node
# Keep this terminal running
```

### Deploy to Local Network
```bash
# In a new terminal
npm run deploy
```

### Expected Output
```
Deploying FoodSupplyChain contract...
FoodSupplyChain contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

=== Deployment Summary ===
Contract: FoodSupplyChain
Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network: localhost
========================
```

## Project Structure

```
backend/blockchain/
├── contracts/
│   └── Blockchain.sol          # Smart contract
├── scripts/
│   └── deploy.js               # Deployment script
├── artifacts/                  # Compiled contracts (generated)
├── cache/                      # Hardhat cache (generated)
├── hardhat.config.cjs          # Hardhat configuration
├── package.json                # Dependencies and scripts
└── .gitignore                  # Git ignore rules
```

## Next Steps

1. **Install dependencies**: Run `npm install` in `backend/blockchain/`
2. **Compile contract**: Run `npm run compile`
3. **Test deployment**: Start local node and deploy
4. **Integrate with backend**: Update backend API to interact with deployed contract
5. **Frontend integration**: Connect frontend to smart contract using ethers.js

## Smart Contract Features

The deployed FoodSupplyChain contract includes:
- ✅ 5 role-based access levels
- ✅ Product registration and tracking
- ✅ Transport history with temperature/location
- ✅ Verification system
- ✅ Complete product journey viewing
- ✅ Events for all major actions

## Troubleshooting

**Issue**: `npm install` fails
- **Solution**: Ensure Node.js 18+ is installed

**Issue**: Compilation errors
- **Solution**: Check Solidity version matches (0.8.0)

**Issue**: Deployment fails
- **Solution**: Ensure local Hardhat node is running first

## Files Location

All blockchain files are in:
`/Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/food-supply-blokchain/backend/blockchain/`
