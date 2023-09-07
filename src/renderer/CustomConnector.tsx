import {
  Address,
  Chain,
  Connector,
  ConnectorData,
  WalletClient,
} from '@wagmi/core';
import { Wallet, JsonRpcProvider } from 'ethers'; // or any other library for handling wallets
import { CONFIG } from './config';

export class CustomConnector extends Connector<JsonRpcProvider, any> {
  readonly id = 'privateKey';

  readonly name = 'Private Key Wallet';

  readonly ready = true;

  #provider?: JsonRpcProvider;

  #privateKey?: string;

  #account?: string;

  constructor({ chains, options }: { chains?: Chain[]; options: any }) {
    super({ chains, options });
  }

  async getProvider() {
    if (!this.#provider) {
      // Initialize the provider with the Ethereum JSON-RPC endpoint
      this.#provider = new JsonRpcProvider(CONFIG.WEB3_AUTH_RPC);
    }
    return this.#provider;
  }

  async getPrivateKey() {
    this.#privateKey = CONFIG.PRIVATE_KEY;
  }

  async connect({ chainId, privateKey }: { chainId?: number, privateKey?: string } = {}): Promise<
    Required<ConnectorData>
  > {
    try {
      this.emit("message", {
        type: "connecting",
      });

      await this.getProvider();
      await this.getPrivateKey();

      // Set up the provider with the private key
      const wallet = new Wallet(this.#privateKey, this.#provider);
      this.#account = wallet.address;

      return {
        account: wallet.address,
        chain: {
          id: Number(chainId),
          unsupported: false,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getWalletClient({ chainId }: { chainId?: number } = {}): Promise<Wallet> {
    
    if (!this.#provider) {
        await this.getProvider();
    }
    if (!this.#privateKey) {
        await this.getPrivateKey();
    }

    const wallet = new Wallet(this.#privateKey, this.#provider);
    return wallet;
 }

  async disconnect() {
    // Clear the private key and provider
    this.#privateKey = undefined;
    this.#provider = undefined;
  }
}
