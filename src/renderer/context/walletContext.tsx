import { ReactNode, createContext, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { FLOCK_ADDRESS } from 'renderer/contracts/flock';

interface WalletContextProviderProps {
  children: ReactNode;
}

interface IWalletContext {
  flockTokenBalance: any;
  nativeTokenBalance: any;
}

export const WalletContext = createContext<IWalletContext>(
  {} as IWalletContext
);

export function WalletContextProvider({
  children,
}: WalletContextProviderProps) {
  const { address } = useAccount();

  const { data: nativeTokenBalance } = useBalance({
    address: address as `0x${string}`,
    watch: true,
  });

  const { data: flockTokenBalance } = useBalance({
    address: address as `0x${string}`,
    token: FLOCK_ADDRESS,
    watch: true,
  });

  const value = useMemo(
    () => ({
      nativeTokenBalance,
      flockTokenBalance,
    }),
    [nativeTokenBalance, flockTokenBalance]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
