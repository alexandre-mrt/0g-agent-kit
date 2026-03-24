import { ethers } from "ethers";
import type { ToolDefinition } from "../core/inference";
import type { AgentWallet } from "../core/wallet";

// Minimal ERC20 ABI
const ERC20_ABI = [
	"function balanceOf(address) view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)",
	"function approve(address spender, uint256 amount) returns (bool)",
	"function transfer(address to, uint256 amount) returns (bool)",
];

// Minimal Uniswap V2 Router ABI
const ROUTER_ABI = [
	"function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)",
	"function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",
];

/**
 * Creates a tool for checking token balances.
 */
export function createBalanceTool(wallet: AgentWallet): ToolDefinition {
	return {
		name: "check_balance",
		description: "Check the balance of a token for the agent's wallet. Use address 'native' for the native token (0G).",
		parameters: {
			type: "object",
			properties: {
				tokenAddress: {
					type: "string",
					description: "Token contract address, or 'native' for native 0G token",
				},
			},
			required: ["tokenAddress"],
		},
		execute: async (args) => {
			const tokenAddress = args.tokenAddress as string;

			if (tokenAddress === "native") {
				const balance = await wallet.getProvider().getBalance(wallet.address);
				return JSON.stringify({
					token: "0G",
					balance: ethers.formatEther(balance),
					address: wallet.address,
				});
			}

			const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet.getProvider());
			const [balance, decimals, symbol] = await Promise.all([
				contract.balanceOf(wallet.address),
				contract.decimals(),
				contract.symbol(),
			]);

			return JSON.stringify({
				token: symbol,
				balance: ethers.formatUnits(balance, decimals),
				address: wallet.address,
			});
		},
	};
}

/**
 * Creates a tool for transferring tokens.
 */
export function createTransferTool(wallet: AgentWallet): ToolDefinition {
	return {
		name: "transfer_token",
		description: "Transfer tokens to another address. Use 'native' for the native 0G token.",
		parameters: {
			type: "object",
			properties: {
				tokenAddress: { type: "string", description: "Token address or 'native'" },
				to: { type: "string", description: "Recipient address" },
				amount: { type: "string", description: "Amount to transfer (human-readable)" },
			},
			required: ["tokenAddress", "to", "amount"],
		},
		execute: async (args) => {
			const { tokenAddress, to, amount } = args as {
				tokenAddress: string;
				to: string;
				amount: string;
			};

			if (tokenAddress === "native") {
				const receipt = await wallet.sendTransaction(to, amount);
				return JSON.stringify({
					success: true,
					txHash: receipt.hash,
					amount,
					to,
				});
			}

			const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet.getSigner());
			const decimals = await contract.decimals();
			const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));
			const receipt = await tx.wait();

			return JSON.stringify({
				success: true,
				txHash: receipt.hash,
				amount,
				to,
			});
		},
	};
}

/**
 * Creates a tool for swapping tokens via a DEX router.
 */
export function createSwapTool(
	wallet: AgentWallet,
	routerAddress: string,
): ToolDefinition {
	return {
		name: "swap_tokens",
		description: "Swap tokens on a DEX. Provide token addresses and amount.",
		parameters: {
			type: "object",
			properties: {
				tokenIn: { type: "string", description: "Address of token to sell" },
				tokenOut: { type: "string", description: "Address of token to buy" },
				amountIn: { type: "string", description: "Amount of tokenIn to sell (human-readable)" },
				slippage: { type: "number", description: "Slippage tolerance in percent (default 0.5)" },
			},
			required: ["tokenIn", "tokenOut", "amountIn"],
		},
		execute: async (args) => {
			const { tokenIn, tokenOut, amountIn, slippage = 0.5 } = args as {
				tokenIn: string;
				tokenOut: string;
				amountIn: string;
				slippage?: number;
			};

			const signer = wallet.getSigner();
			const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);

			const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
			const decimals = await tokenInContract.decimals();
			const parsedAmount = ethers.parseUnits(amountIn, decimals);

			// Get expected output
			const amounts = await router.getAmountsOut(parsedAmount, [tokenIn, tokenOut]);
			const expectedOut = amounts[1];
			const minOut = (expectedOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

			// Approve router
			const approveTx = await tokenInContract.approve(routerAddress, parsedAmount);
			await approveTx.wait();

			// Execute swap
			const deadline = Math.floor(Date.now() / 1000) + 300; // 5 min
			const tx = await router.swapExactTokensForTokens(
				parsedAmount,
				minOut,
				[tokenIn, tokenOut],
				wallet.address,
				deadline,
			);

			const receipt = await tx.wait();

			return JSON.stringify({
				success: true,
				txHash: receipt.hash,
				amountIn,
				expectedAmountOut: ethers.formatUnits(expectedOut, 18),
				minAmountOut: ethers.formatUnits(minOut, 18),
			});
		},
	};
}

/**
 * Creates a tool for getting token price quotes from a DEX.
 */
export function createPriceQuoteTool(
	wallet: AgentWallet,
	routerAddress: string,
): ToolDefinition {
	return {
		name: "get_price_quote",
		description: "Get a price quote for swapping tokens on the DEX.",
		parameters: {
			type: "object",
			properties: {
				tokenIn: { type: "string", description: "Address of token to sell" },
				tokenOut: { type: "string", description: "Address of token to buy" },
				amountIn: { type: "string", description: "Amount of tokenIn (human-readable)" },
			},
			required: ["tokenIn", "tokenOut", "amountIn"],
		},
		execute: async (args) => {
			const { tokenIn, tokenOut, amountIn } = args as {
				tokenIn: string;
				tokenOut: string;
				amountIn: string;
			};

			const router = new ethers.Contract(routerAddress, ROUTER_ABI, wallet.getProvider());
			const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, wallet.getProvider());
			const decimals = await tokenInContract.decimals();
			const parsedAmount = ethers.parseUnits(amountIn, decimals);

			const amounts = await router.getAmountsOut(parsedAmount, [tokenIn, tokenOut]);

			return JSON.stringify({
				tokenIn,
				tokenOut,
				amountIn,
				amountOut: ethers.formatUnits(amounts[1], 18),
				rate: Number(amounts[1]) / Number(parsedAmount),
			});
		},
	};
}
