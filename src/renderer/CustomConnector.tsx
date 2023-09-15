import { Chain, Connector, ConnectorData, WalletClient } from '@wagmi/core';
import { privateKeyToAccount } from 'viem/accounts';
import { PrivateKeyAccount, createWalletClient, http } from 'viem';
import { CONFIG } from './config';

export default class CustomConnector extends Connector<any, any> {
  readonly id = 'privateKey';

  readonly name = 'Private Key Wallet';

  readonly ready = true;

  #provider?: any;

  #account?: PrivateKeyAccount;

  constructor({ chains, options }: { chains?: Chain[]; options: any }) {
    super({ chains, options });
  }

  async getProvider() {
    if (!this.#provider) {
      // Initialize the provider with the Ethereum JSON-RPC endpoint
      this.#provider = http(CONFIG.WEB3_AUTH_RPC);
    }
    return this.#provider;
  }

  async getAccount() {
    const privateKey = await this.getPrivateKey();

    // Set up the provider with the private key
    const account = privateKeyToAccount(privateKey);
    this.#account = account;
    // return checksum address
    return account.address;
  }

  async getPrivateKey() {
    return localStorage.getItem('privateKey');
  }

  async setPrivateKey(privateKey: string) {
    localStorage.setItem('privateKey', privateKey);
  }

  async deletePrivateKey() {
    localStorage.removeItem('privateKey');
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<
    Required<ConnectorData>
  > {
    try {
      this.emit('message', {
        type: 'connecting',
      });

      await this.getProvider();
      await this.getAccount();

      return {
        account: this.#account?.address as `0x${string}`,
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

  async getWalletClient({
    chainId,
  }: { chainId?: number } = {}): Promise<WalletClient> {
    if (!this.#provider) {
      await this.getProvider();
    }
    await this.getAccount();

    const chain = this.chains.find((x) => x.id === chainId);

    return createWalletClient({
      account: this.#account,
      chain,
      transport: this.#provider,
    });
  }

  async isAuthorized() {
    try {
      await this.getAccount();
      return !!this.#account;
    } catch {
      return false;
    }
  }

  async disconnect() {
    // Clear the private key and provider
    this.deletePrivateKey();
    this.#provider = undefined;
  }
}
