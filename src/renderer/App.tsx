import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Grommet } from 'grommet';
import './App.css';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import Dashboard from './pages/Dashboard';
import Train from './pages/Train';
import { WalletContextProvider } from './context/walletContext';

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

  const { publicClient, webSocketPublicClient } = configureChains(
    [polygonMumbai],
    [
      alchemyProvider({ apiKey: 'EYw3QP6mtvV04aYoqALiAVrh16Anq1AR' }),
      publicProvider(),
    ]
  );

  const config = createConfig({
    autoConnect: true,
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
            </Routes>
          </Router>
        </WalletContextProvider>
      </WagmiConfig>
    </Grommet>
  );
}
