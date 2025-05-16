# LiquidityPool

A TON blockchain liquidity pool contract implementation.

## Prerequisites

- Node.js >= 22.0.0
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pedrofy-contracts-pools
```

2. Install dependencies:
```bash
npm install
```

## Development

### Building the Contract

To build the contract:
```bash
npm run build
```

When running the build command, you'll be prompted to select which contract to build:
- `FactoryContract` - The main factory contract that manages liquidity pools
- `PairContract` - The contract for individual trading pairs
- `All Contracts` - Builds both contracts (recommended)

The build process will:
1. Compile the selected contract(s) using FunC version 0.4.6
2. Generate compilation artifacts in the `build/` directory:
   - `FactoryContract.compiled.json`
   - `PairContract.compiled.json`

Each compiled contract will include:
- Contract hash
- Base64 encoded hash
- Hex representation of the contract

### Deploying the Contract

To deploy the contract:
```bash
npm run deploy
```

### Running Tests

To run the test suite:
```bash
npm test
```

To run tests in watch mode (automatically re-runs tests when files change):
```bash
npm run test:watch
```

## Project Structure

- `contracts/` - Contains the TON smart contracts
  - `factorycontract.fc` - The factory contract that manages liquidity pools
  - `paircontract.fc` - The contract for individual trading pairs
  - `imports/` - Shared contract imports
- `build/` - Contains compiled contract artifacts
- `scripts/` - Deployment and interaction scripts
- `tests/` - Test files for the contracts
  - `LiquidityPool.spec.ts` - Main test suite

## Dependencies

- `@ton/blueprint` - TON development framework
- `@ton/core` - Core TON functionality
- `@ton/crypto` - Cryptographic utilities
- `@ton/sandbox` - Testing utilities
- `@tact-lang/compiler` - TACT language compiler

### Development Dependencies

- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `@types/jest` - TypeScript type definitions for Jest

## License

MIT