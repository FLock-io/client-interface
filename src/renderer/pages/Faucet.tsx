import { Box, Button, Heading, Paragraph } from 'grommet';
import { useEffect, useState, useContext } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import Layout from 'renderer/components/Layout';
import { FLOCK_ABI, FLOCK_ADDRESS } from '../contracts/flock';
import {
  MIGRATE_TOKENS_ABI,
  MIGRATE_TOKENS_ADDRESS,
} from '../contracts/migrateTokens';
import { WalletContext } from '../context/walletContext';

export default function FaucetPage() {
  const { address } = useAccount();
  const [errors, setErrors] = useState<any>({});
  const [disabled, setDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { FLCTokenBalance } = useContext(WalletContext);

  const { data: dataMigrate, write: writeMigrate } = useContractWrite({
    address: MIGRATE_TOKENS_ADDRESS as `0x${string}`,
    abi: MIGRATE_TOKENS_ABI,
    functionName: 'migrate',
  });

  const { data: dataApprove, write: writeApprove } = useContractWrite({
    address: FLOCK_ADDRESS as `0x${string}`,
    abi: FLOCK_ABI,
    functionName: 'approve',
  });

  const { isSuccess: isSuccessMigrate } = useWaitForTransaction({
    hash: dataMigrate?.hash,
  });

  const { isSuccess: isSuccessApprove } = useWaitForTransaction({
    hash: dataApprove?.hash,
  });

  const handleApprove = async () => {
    setIsLoading(true);
    writeApprove?.({
      args: [MIGRATE_TOKENS_ADDRESS as `0x${string}`, FLCTokenBalance.value],
    });
  };

  useEffect(() => {
    if (isSuccessApprove) {
      writeMigrate?.();
    }
    if (isSuccessMigrate) {
      setIsLoading(false);
    }
  }, [isSuccessApprove, isSuccessMigrate]);

  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    setDisabled(!address || hasErrors || isLoading);
  }, [address, isLoading]);

  const roundedFLCBalance = FLCTokenBalance
    ? Math.round(Number(FLCTokenBalance.formatted) * 100) / 100
    : 0;

  return (
    <Layout>
      <Box width="100%" gap="large">
        <Box
          background="#EEEEEE"
          direction="row-responsive"
          align="center"
          justify="center"
          width="100%"
          pad={{ vertical: 'large', horizontal: 'large' }}
        >
          <Box>
            <Box direction="row-responsive" gap="xsmall">
              <Heading level="2">FLock (FLO) tokens faucet </Heading>
            </Box>
            <Paragraph>
              Migrate your FLC to FLO tokens for participating in the FLock network.
            </Paragraph>
            <Paragraph>
              {roundedFLCBalance} FLC tokens available to migrate.
            </Paragraph>
          </Box>
        </Box>
        <Box
          width="100%"
          align="center"
          pad="large"
          background="white"
          justify="center"
          round="small"
        >
          <Box direction="row" align="end" justify="end">
            <Button
              primary
              onClick={handleApprove}
              disabled={disabled || roundedFLCBalance === 0}
              label={isLoading ? 'Migrating...' : 'Migrate'}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
