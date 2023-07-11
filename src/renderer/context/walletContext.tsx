import { ethers } from 'ethers';
import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { writeStorage, useLocalStorage } from '@rehooks/local-storage';

interface WalletContextProviderProps {
  children: ReactNode;
}

interface IWalletContext {
  address: string;
  privateKey: string;
  error: string;
  setPrivateKey: (privateKey: string) => void;
  setError: (error: string) => void;
  disconnect: () => void;
}

export const WalletContext = createContext<IWalletContext>(
  {} as IWalletContext
);

const provider = new ethers.JsonRpcProvider(
  'https://polygon-mumbai.g.alchemy.com/v2/EYw3QP6mtvV04aYoqALiAVrh16Anq1AR'
);

export function WalletContextProvider({
  children,
}: WalletContextProviderProps) {
  const [address, setAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [pk] = useLocalStorage('pk');

  const disconnect = () => {
    setPrivateKey('');
    writeStorage('pk', '');
    setAddress('');
  };

  const value = useMemo(
    () => ({ address, privateKey, setPrivateKey, error, setError, disconnect }),
    [address, privateKey, setPrivateKey, error, setError]
  );

  const loadWallet = async () => {
    try {
      const signer = new ethers.Wallet(privateKey, provider);
      writeStorage('pk', privateKey);
      setAddress(signer.address);
    } catch (err) {
      setError('Invalid private key');
    }
  };

  useEffect(() => {
    if (privateKey) {
      loadWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateKey]);

  useEffect(() => {
    if (pk) {
      setPrivateKey(pk);
    }
  }, [pk]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
