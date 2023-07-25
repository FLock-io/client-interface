import { ethers } from 'ethers';
import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { writeStorage, useLocalStorage } from '@rehooks/local-storage';
import { useBalance } from 'wagmi';
import { FLOCK_ADDRESS } from 'renderer/contracts/flock';

interface WalletContextProviderProps {
  children: ReactNode;
}

interface IWalletContext {
  address: string;
  privateKey: string;
  error: string;
  flockTokenBalance: any;
  nativeTokenBalance: any;
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

  const { data: nativeTokenBalance } = useBalance({
    address: address as `0x${string}`,
    watch: true,
  });

  const { data: flockTokenBalance } = useBalance({
    address: address as `0x${string}`,
    token: FLOCK_ADDRESS,
    watch: true,
  });

  const disconnect = () => {
    setPrivateKey('');
    writeStorage('pk', '');
    setAddress('');
  };

  const value = useMemo(
    () => ({
      address,
      privateKey,
      setPrivateKey,
      error,
      setError,
      disconnect,
      nativeTokenBalance,
      flockTokenBalance,
    }),
    [
      address,
      privateKey,
      setPrivateKey,
      error,
      setError,
      nativeTokenBalance,
      flockTokenBalance,
    ]
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
