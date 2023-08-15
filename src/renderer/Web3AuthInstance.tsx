import { configureChains } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { Web3Auth } from '@web3auth/modal';
import { CONFIG } from './config'; // Make sure to import the relevant config

const { chains } = configureChains([polygonMumbai], [
  alchemyProvider({ apiKey: 'Qsvi2mE7TTt44pEwkojqyqdRb1s0xAQV' }),
]);

const chainConfig = {
  chainNamespace: 'eip155',
  chainId: `0x${chains[0].id.toString(16)}`,
  // @ts-ignore
  rpcTarget: CONFIG.WEB3_AUTH_RPC,
  displayName: chains[0].name,
  tickerName: chains[0].nativeCurrency?.name,
  ticker: chains[0].nativeCurrency?.symbol,
  blockExplorer: chains[0]?.blockExplorers.default?.url,
};

export const web3AuthInstance = new Web3Auth({
  clientId: CONFIG.WEB3_AUTH_CLIENT_ID,
  web3AuthNetwork: 'cyan',
  // @ts-ignore
  chainConfig,
  authMode: 'WALLET',
  uiConfig: {
    theme: 'light',
    appName: 'FLock Client',
    appLogo:
      'https://drive.google.com/uc?export=download&id=1Pm_naD3LlamhxkEVv-i2VBVG2RC4DYaZ',
  },
});
