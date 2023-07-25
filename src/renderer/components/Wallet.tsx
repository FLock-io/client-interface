import { Box, Button, Heading, Layer, Text } from 'grommet';
import { useContext, useState } from 'react';
import { WalletContext } from 'renderer/context/walletContext';
import truncateEthAddress from 'truncate-eth-address';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function Wallet() {
  const { address } = useAccount();
  const [showWalletSettings, setShowWalletSettings] = useState(false);
  const { connectAsync, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { nativeTokenBalance, flockTokenBalance } = useContext(WalletContext);

  const handleConnect = async () => {
    await connectAsync({
      connector: connectors[0],
    });
  };

  const handleDisconnect = async () => {
    wagmiDisconnect();
  };

  if (showWalletSettings) {
    return (
      <Layer onEsc={() => setShowWalletSettings(false)} full>
        <Box
          align="center"
          justify="center"
          height="100vh"
          pad="large"
          gap="medium"
        >
          <Heading level="3">Wallet Settings</Heading>
          <Box align="start" gap="xsmall">
            <Text>
              <b>Wallet Address:</b> {address}
            </Text>
            <Text>
              <b>FLock(FLC) Balance: </b>
              {flockTokenBalance ? flockTokenBalance.formatted : 0} $F
            </Text>
            <Text>
              <b>MATIC Balance: </b>
              {nativeTokenBalance ? nativeTokenBalance.formatted : 0} $MATIC
            </Text>
          </Box>
          <Box direction="row" alignSelf="end" gap="small">
            <Button
              secondary
              label="Go Back"
              onClick={() => setShowWalletSettings(false)}
            />
            <Button
              primary
              label="Disconnect"
              onClick={() => {
                handleDisconnect();
                setShowWalletSettings(false);
              }}
            />
          </Box>
        </Box>
      </Layer>
    );
  }

  return (
    <Button
      primary
      label={
        !address
          ? 'Connect Wallet'
          : `(${
              flockTokenBalance ? flockTokenBalance.formatted : 0
            } $F) ${truncateEthAddress(address)}`
      }
      pad="xsmall"
      onClick={
        address
          ? () => {
              setShowWalletSettings(true);
            }
          : () => {
              handleConnect();
            }
      }
    />
  );
}

export default Wallet;
