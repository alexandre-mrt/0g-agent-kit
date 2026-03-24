# 0G Agent Kit

## Overview
TypeScript SDK for building, deploying, and monetizing AI agents on the 0G network.
INFT minting (ERC-7857), decentralized memory (0G Storage), compute inference, DeFi tools.

## Structure
```
src/
  core/        - Agent, Inference, Memory, Wallet
  inft/        - INFT minting/transfer (ERC-7857)
  tools/       - DeFi, Storage, Web tools for agents
  templates/   - Pre-built agent templates (trading, assistant)
  utils/       - Config (Zod), Crypto (AES-256-GCM)
  quick.ts     - quickAgent() one-line helper
contracts/     - Solidity INFT contract (ERC-7857)
examples/      - Usage examples (simple, defi, inft-mint)
```

## Stack
- Runtime: Bun / Node.js
- Language: TypeScript (strict)
- Dependencies: ethers v6, @0gfoundation/0g-ts-sdk, zod
- Smart Contracts: Solidity ^0.8.19, OpenZeppelin v5
- CI: GitHub Actions
- Tests: 177 tests via bun test

## Commands
- `bun install` - Install dependencies
- `bun run dev` - Run simple agent example
- `bun test` - Run all 177 tests
- `bun run build` - Build for distribution

## Quick Start
```typescript
import { quickAgent } from '0g-agent-kit';

const agent = quickAgent({
  name: 'MyBot',
  inferenceEndpoint: 'https://api.openai.com',
  inferenceApiKey: process.env.OPENAI_API_KEY,
});

const result = await agent.run('Check the current time');
```

## Environment
Copy `.env.example` to `.env`:
- `ZG_PRIVATE_KEY` - 0G wallet private key
- `INFERENCE_ENDPOINT` - AI inference API
- `INFERENCE_API_KEY` - Inference API key
