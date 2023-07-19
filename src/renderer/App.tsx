import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Grommet } from 'grommet';
import './App.css';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import { Web3Auth } from '@web3auth/modal';
import Dashboard from './pages/Dashboard';
import Train from './pages/Train';
import { WalletContextProvider } from './context/walletContext';
import Faucet from './pages/faucet';
import { CONFIG } from './config';

export default function App() {
  const flockTheme = {
    global: {
      font: {
        family: 'Gilroy',
      },
      focus: {
        border: {
          color: 'transparent',
        },
      },
      colors: {
        brand: '#6C94EC',
      },
    },
    button: {
      default: {
        background: { color: '#6C94EC' },
        border: { color: '#000000' },
      },
      color: '#FFFFFF',
      border: { width: '2px', radius: '8px', color: '#000000' },
      primary: {
        border: { width: '2px', radius: '8px', color: '#000000' },
        font: { weight: 'bold' },
        color: '#FFFFFF',
        background: {
          color: '#6C94EC',
        },
      },
      secondary: {
        border: { width: '2px', radius: '8px', color: '#000000' },
        font: { weight: 'bold' },
        color: '#000000',
        background: {
          color: '#EEEEEE',
        },
      },
    },
    formField: { label: { requiredIndicator: true } },
  };

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [polygonMumbai],
    [
      alchemyProvider({ apiKey: 'Qsvi2mE7TTt44pEwkojqyqdRb1s0xAQV' }),
      publicProvider(),
    ]
  );

  const web3AuthInstance = new Web3Auth({
    clientId: CONFIG.WEB3_AUTH_CLIENT_ID,
    chainConfig: {
      chainNamespace: 'eip155',
      chainId: `0x${chains[0].id.toString(16)}`,
      // @ts-ignore
      rpcTarget: CONFIG.WEB3_AUTH_RPC,
      displayName: chains[0].name,
      tickerName: chains[0].nativeCurrency?.name,
      ticker: chains[0].nativeCurrency?.symbol,
      blockExplorer: chains[0]?.blockExplorers.default?.url,
    },
    authMode: 'WALLET',
    uiConfig: {
      theme: 'light',
      appName: 'FLock Client',
      appLogo:
        'https://drive.google.com/uc?export=download&id=1Pm_naD3LlamhxkEVv-i2VBVG2RC4DYaZ',
    },
  });

  const config = createConfig({
    autoConnect: true,
    connectors: [
      new Web3AuthConnector({
        chains,
        options: {
          web3AuthInstance,
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  return (
    <Grommet theme={flockTheme}>
      <WagmiConfig config={config}>
        <WalletContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/train" element={<Train />} />
              <Route path="/faucet" element={<Faucet />} />
            </Routes>
          </Router>
        </WalletContextProvider>
      </WagmiConfig>
    </Grommet>
  );
}
