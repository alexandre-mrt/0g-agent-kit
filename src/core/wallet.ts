import { ethers } from "ethers";

export interface WalletInfo {
	address: string;
	balance: string;
	chainId: number;
}

/**
 * Manages an agent's wallet for on-chain transactions.
 */
export class AgentWallet {
	private readonly provider: ethers.JsonRpcProvider;
	private readonly signer: ethers.Wallet;

	constructor(privateKey: string, rpcUrl: string) {
		this.provider = new ethers.JsonRpcProvider(rpcUrl);
		this.signer = new ethers.Wallet(privateKey, this.provider);
	}

	get address(): string {
		return this.signer.address;
	}

	getSigner(): ethers.Wallet {
		return this.signer;
	}

	getProvider(): ethers.JsonRpcProvider {
		return this.provider;
	}

	async getInfo(): Promise<WalletInfo> {
		const [balance, network] = await Promise.all([
			this.provider.getBalance(this.signer.address),
			this.provider.getNetwork(),
		]);

		return {
			address: this.signer.address,
			balance: ethers.formatEther(balance),
			chainId: Number(network.chainId),
		};
	}

	async sendTransaction(to: string, value: string): Promise<ethers.TransactionReceipt> {
		const tx = await this.signer.sendTransaction({
			to,
			value: ethers.parseEther(value),
		});

		const receipt = await tx.wait();
		if (!receipt) {
			throw new Error("Transaction failed: no receipt");
		}

		return receipt;
	}

	async callContract(
		contractAddress: string,
		abi: ethers.InterfaceAbi,
		method: string,
		args: unknown[],
		value?: string,
	): Promise<ethers.TransactionReceipt> {
		const contract = new ethers.Contract(contractAddress, abi, this.signer);
		const tx = value
			? await contract[method](...args, { value: ethers.parseEther(value) })
			: await contract[method](...args);

		const receipt = await tx.wait();
		if (!receipt) {
			throw new Error(`Contract call to ${method} failed: no receipt`);
		}

		return receipt;
	}

	async readContract(
		contractAddress: string,
		abi: ethers.InterfaceAbi,
		method: string,
		args: unknown[],
	): Promise<unknown> {
		const contract = new ethers.Contract(contractAddress, abi, this.provider);
		return contract[method](...args);
	}
}
