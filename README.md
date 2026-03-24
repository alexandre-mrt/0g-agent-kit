# 0G Agent Kit

[![CI](https://github.com/alexandre-mrt/0g-agent-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/alexandre-mrt/0g-agent-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TypeScript SDK for building, deploying, and monetizing AI agents on the 0G network.**

Build autonomous AI agents that can trade DeFi, manage wallets, store persistent memory on 0G Storage, and mint themselves as INFTs (ERC-7857) for ownership transfer and monetization.

## Features

- **Agent Framework** - Agentic loop with tool execution, powered by LLM inference
- **INFT Support** - Mint AI agents as ERC-7857 tokens with encrypted metadata
- **Decentralized Memory** - Persistent agent memory via 0G Storage
- **DeFi Tools** - Built-in tools for swaps, transfers, balance checks, price quotes
- **Pre-built Templates** - Trading agent, personal assistant, ready to customize
- **0G Native** - First-class integration with 0G Chain, Storage, and Compute

## Quick Start

### Install

```bash
bun add 0g-agent-kit
# or
npm install 0g-agent-kit
```

### Create an Agent

```typescript
import { createAssistantAgent } from '0g-agent-kit';

const agent = createAssistantAgent({
  name: 'MyAgent',
  inference: {
    endpoint: 'https://api.openai.com', // or 0G Compute endpoint
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 2048,
    temperature: 0.7,
  },
  useLocalMemory: true,
});

const result = await agent.run('What is the current time?');
console.log(result.output);
```

### DeFi Trading Agent

```typescript
import { createTradingAgent } from '0g-agent-kit';

const trader = createTradingAgent({
  name: 'DeFiBot',
  inference: { /* ... */ },
  dexRouterAddress: '0x...', // Your DEX router
  zeroG: {
    evmRpc: 'https://evmrpc-testnet.0g.ai',
    indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
    privateKey: process.env.ZG_PRIVATE_KEY,
  },
});

const result = await trader.run('Check my balance and suggest a trade');
```

### Mint Agent as INFT

```typescript
import { mintINFT, createAssistantAgent } from '0g-agent-kit';

const agent = createAssistantAgent({ /* ... */ });

const inft = await mintINFT(agent.getWallet(), {
  contractAddress: '0x...', // Deployed INFT contract
  agent,
  capabilities: ['memory', 'web-browsing', 'wallet'],
});

console.log('Token ID:', inft.tokenId);
console.log('Encryption Key:', inft.encryptionKey); // Save securely!
```

## Architecture

```
Agent
  |-- Inference (0G Compute / OpenAI)
  |-- Memory (0G Storage / Local)
  |-- Wallet (0G Chain)
  |-- Tools
       |-- DeFi (swap, transfer, balance, quote)
       |-- Storage (save, load, list memory)
       |-- Web (fetch pages, time)
```

### Agent Loop

1. User sends message
2. Agent calls LLM with system prompt + tools
3. LLM returns text response or tool calls
4. Agent executes tool calls, feeds results back
5. Repeat until LLM returns final text (or max iterations)

## API Reference

### Core Classes

| Class | Description |
|-------|-------------|
| `Agent` | Core agent with agentic loop, tools, and state management |
| `ZeroGInference` | OpenAI-compatible inference client for 0G Compute |
| `ZeroGMemory` | 0G Storage-backed persistent memory |
| `LocalMemory` | In-memory storage for development |
| `AgentWallet` | Wallet management for on-chain transactions |

### INFT Functions

| Function | Description |
|----------|-------------|
| `mintINFT()` | Mint an agent as ERC-7857 INFT |
| `transferINFT()` | Transfer INFT with re-encrypted metadata |
| `authorizeUsage()` | Grant temporary usage rights |
| `cloneINFT()` | Clone an INFT |

### Tool Factories

| Function | Description |
|----------|-------------|
| `createBalanceTool()` | Check token balances |
| `createTransferTool()` | Transfer tokens |
| `createSwapTool()` | DEX token swaps |
| `createPriceQuoteTool()` | Get swap quotes |
| `createSaveMemoryTool()` | Save to 0G Storage |
| `createLoadMemoryTool()` | Load from 0G Storage |
| `createFetchWebTool()` | Fetch web pages |

### Templates

| Template | Description |
|----------|-------------|
| `createTradingAgent()` | Autonomous DeFi trading agent |
| `createAssistantAgent()` | Personal assistant with memory |

## Smart Contract

The `contracts/INFT.sol` implements ERC-7857 with:
- `mint()` - Create new INFT with encrypted metadata
- `transfer()` - Secure transfer with re-encryption proof
- `authorizeUsage()` - Grant temporary access
- `clone()` - Duplicate an INFT
- `isAuthorized()` - Check usage rights

Deploy to 0G Chain:
- **Testnet:** RPC `https://evmrpc-testnet.0g.ai` | Chain ID `16602`
- **Mainnet:** RPC `https://evmrpc.0g.ai` | Chain ID `16661`

## Custom Tools

```typescript
import { Agent, AgentWallet, ZeroGInference, LocalMemory } from '0g-agent-kit';
import type { ToolDefinition } from '0g-agent-kit';

const myTool: ToolDefinition = {
  name: 'my_custom_tool',
  description: 'Does something useful',
  parameters: {
    type: 'object',
    properties: {
      input: { type: 'string', description: 'Input data' },
    },
    required: ['input'],
  },
  execute: async (args) => {
    return JSON.stringify({ result: `Processed: ${args.input}` });
  },
};

const agent = new Agent(
  { name: 'CustomAgent', model: 'gpt-4o-mini', maxIterations: 10, temperature: 0.7 },
  {
    memory: new LocalMemory(),
    wallet: new AgentWallet(process.env.ZG_PRIVATE_KEY!, 'https://evmrpc-testnet.0g.ai'),
    inference: new ZeroGInference({ endpoint: '...', model: 'gpt-4o-mini', maxTokens: 2048, temperature: 0.7 }),
  },
  [myTool],
);
```

## 0G Grant Eligibility

This project targets the **$88.88M 0G Ecosystem Growth Program**:
- **Category:** Developer tooling / AI agent infrastructure
- **Impact:** Lowers barrier for building AI agents on 0G
- **Interoperability:** Works with 0G Storage, Compute, Chain, and INFT standard
- **Sustainability:** Open-source core + managed hosting revenue model

## License

MIT
