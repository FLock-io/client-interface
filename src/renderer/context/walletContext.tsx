import { ReactNode, createContext, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { FLOCK_ADDRESS } from 'renderer/contracts/flock';
import { FLOCK_V2_ADDRESS } from 'renderer/contracts/flockV2';

interface WalletContextProviderProps {
  children: ReactNode;
}

interface IWalletContext {
  FLCTokenBalance: any;
  FLOTokenBalance: any;
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

  const { data: FLCTokenBalance } = useBalance({
    address: address as `0x${string}`,
    token: FLOCK_ADDRESS as `0x${string}`,
    watch: true,
  });

  const { data: FLOTokenBalance } = useBalance({
    address: address as `0x${string}`,
    token: FLOCK_V2_ADDRESS as `0x${string}`,
    watch: true,
  });

  const value = useMemo(
    () => ({
      nativeTokenBalance,
      FLCTokenBalance,
      FLOTokenBalance,
    }),
    [nativeTokenBalance, FLCTokenBalance, FLOTokenBalance]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
