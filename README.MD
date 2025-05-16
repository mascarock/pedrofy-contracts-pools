# TON DEX - Decentralized Exchange Protocol on TON

This project implements a decentralized exchange protocol (DEX) on the TON blockchain, inspired by the AMM (Automated Market Maker) model similar to Uniswap. The system allows creating token exchange pairs, adding/removing liquidity, and performing swap operations between tokens.

## Project Structure

The project consists of two main contracts written in FunC and their corresponding TypeScript wrappers:

1. **Factory Contract**: Manages the creation of exchange pairs.
2. **Pair Contract**: Implements the liquidity and swap logic for each token pair.

## Architecture

### Factory Contract

The Factory contract is the central point of the protocol, responsible for:

- Creating new exchange pairs (each pair is an instance of the Pair contract)
- Maintaining a registry of all existing pairs
- Managing global configuration such as default fees
- Administering fee collection

### Pair Contract

Each Pair contract represents an exchange pair between two specific tokens and handles:

- Adding liquidity to the pool
- Removing liquidity from the pool
- Swap operations between the two tokens
- Transfer of LP (Liquidity Provider) tokens
- Automatic price calculation based on the formula x * y = k

## Communication between contracts

1. The Factory Contract deploys new Pair contracts with their respective initial configurations.
2. The Factory maintains a registry of addresses for all created pairs.
3. The Pair contracts contain a reference to their Factory, allowing bidirectional communication.
4. The Factory can collect fees accumulated by the Pair contracts.

## Installation and Usage

### Prerequisites

- Node.js (v16 or higher)
- Yarn

### Installation

```bash
yarn install
```

### Compilation

To compile the contracts:

```bash
yarn build
```

### Deployment

#### Deploy Factory Contract

```bash
yarn deploy
```

Follow the instructions in the terminal to configure:
- Select deployFactoryContract or deployPairContract
- Select testnet or mainnet network
- Select Toonkeeper Wallet to connect wallet
- Follow instructions after deployment, there will be a direct link to the contract

### Troubleshooting

If you encounter an error when creating a pair, verify:

1. That the token addresses are in the correct format
2. That the tokens are different from each other
3. That you have enough TON for the operation (at least 0.3 TON)
4. That the pair doesn't already exist in the Factory

## Operations

### Factory Contract

- **createPair**: Creates a new exchange pair (opcode: 0x12a2d48c)
- **setFee**: Configures the default fee (opcode: 0x637f0d2b)
- **collectFee**: Collects accumulated fees (opcode: 0x5dbd0308)

### Pair Contract

- **addLiquidity**: Adds liquidity to the pool (opcode: 0x234c7bef)
- **removeLiquidity**: Removes liquidity from the pool (opcode: 0x5edc1170)
- **swap**: Exchanges tokens (opcode: 0x107c51ee)
- **transfer**: Transfers LP tokens (opcode: 0x7362d09c)

## Technical Information

### Factory Variables

- **ctx_owner**: Address of the factory owner
- **ctx_pairs**: Dictionary of pairs (token0, token1) -> pair_address
- **ctx_pair_code**: Contract code for pairs
- **ctx_default_fee**: Default fee for new pairs
- **ctx_fee_collector**: Address for collecting fees
- **ctx_total_pairs**: Counter of created pairs

### Pair Variables

- **ctx_token0_address, ctx_token1_address**: Token addresses
- **ctx_reserve0, ctx_reserve1**: Token reserves
- **ctx_total_supply**: Total supply of LP tokens
- **ctx_lp_balances**: LP token balances by address
- **ctx_fee**: Pair fee
- **ctx_factory_address**: Factory address

## Wrappers

The TypeScript wrappers provide a simple interface to interact with the contracts:

- **LiquidityPool**: Wrapper for the Factory Contract
- **PairContract**: Wrapper for the Pair Contract

These wrappers facilitate the integration of the DEX with frontend applications or services.

## Key Formulas

- **Swap**: Uses the constant product formula where `x * y = k`
- **Fee**: A percentage (in basis points) is applied to each operation
- **LP Tokens**: For the first liquidity addition, `LP = sqrt(amount0 * amount1)`



# Pair Creation Script - TON DEX

This document explains the functionality of the `createPair.ts` script, which is used to create new liquidity pairs in the TON DEX protocol.

## Description

The `createPair.ts` script is a tool for interacting with the Factory Contract and creating new exchange pairs (Pair Contracts) for two specified tokens. **Currently, this script has issues when trying to create pairs.**

## Operation

The script follows these steps:

1. **Connection to Factory Contract**: Uses the provided address to connect to the deployed Factory Contract.
2. **Token verification**: Requests the addresses of the two tokens that will form the exchange pair.
3. **Existence check**: Verifies if the pair already exists to avoid duplicates.
4. **Pair creation**: Sends a transaction to the Factory Contract to create a new pair.
5. **Confirmation polling**: Repeatedly waits and verifies until confirming that the pair has been created.
6. **Final information**: Displays details about the created pair and Factory statistics.

## Usage

```bash
yarn deploy select file createpair.ts
```
- follow instructions
- enter the FactoryContract address
- enter token0 and token1 addresses


## Known Issues

🚨 **This script is currently failing when trying to create pairs.** 🚨