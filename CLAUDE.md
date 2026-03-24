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
  templates/   - Pre-built agent templates
  utils/       - Config (Zod), Crypto (AES-256-GCM)
contracts/     - Solidity INFT contract
examples/      - Usage examples
```

## Stack
- Runtime: Bun / Node.js
- Language: TypeScript (strict)
- Dependencies: ethers v6, @0gfoundation/0g-ts-sdk, zod
- Smart Contracts: Solidity ^0.8.19, OpenZeppelin v5

## Commands
- `bun install` - Install dependencies
- `bun run dev` - Run simple agent example
- `bun test` - Run tests
- `bun run lint` - Lint with Biome
- `bun run typecheck` - TypeScript check

## Environment
Copy `.env.example` to `.env`:
- `ZG_PRIVATE_KEY` - 0G wallet private key
- `INFERENCE_ENDPOINT` - AI inference API (0G Compute or OpenAI-compatible)
- `INFERENCE_API_KEY` - Inference API key
