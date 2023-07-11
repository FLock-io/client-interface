import { ethers } from 'ethers';
import { Box, Button, Heading, Layer, Text, TextInput } from 'grommet';
import { useContext, useEffect, useState } from 'react';
import { WalletContext } from 'renderer/context/walletContext';
import { FLOCK_ABI, FLOCK_ADDRESS } from 'renderer/contracts/flock';
import truncateEthAddress from 'truncate-eth-address';
import { useContractRead } from 'wagmi';

function Wallet() {
  const { address, setPrivateKey, error, setError, disconnect } =
    useContext(WalletContext);
  const [showImportWallet, setShowImportWallet] = useState(false);
  const [enteredPrivasteKey, setEnteredPrivateKey] = useState('');
  const [showWalletSettings, setShowWalletSettings] = useState(false);

  const { data } = useContractRead({
    address: FLOCK_ADDRESS as `0x${string}`,
    abi: FLOCK_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const connectWallet = async () => {
    setPrivateKey(enteredPrivasteKey);
  };

  useEffect(() => {
    if (address) {
      setShowImportWallet(false);
    }
  }, [address]);

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
              <b>FLock(FLC) Balance:</b>
              {data ? ethers.formatEther(data) : 0} $F
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
                disconnect();
                setShowWalletSettings(false);
              }}
            />
          </Box>
        </Box>
      </Layer>
    );
  }

  if (showImportWallet) {
    return (
      <Layer onEsc={() => setShowImportWallet(false)} full>
        <Box
          align="center"
          justify="center"
          height="100vh"
          pad="large"
          gap="large"
        >
          <Box width="100%" align="center">
            <TextInput
              value={enteredPrivasteKey}
              placeholder="Enter private key"
              onChange={(e) => setEnteredPrivateKey(e.target.value)}
            />
            {error && (
              <Heading level="4" color="#BA0000">
                {error}
              </Heading>
            )}
          </Box>
          <Box direction="row" gap="small">
            <Button
              secondary
              label="Cancel"
              onClick={() => setShowImportWallet(false)}
            />
            <Button primary label="Connect" onClick={connectWallet} />
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
          : `(${data ? ethers.formatEther(data) : 0} $F) ${truncateEthAddress(
              address
            )}`
      }
      pad="xsmall"
      onClick={
        address
          ? () => {
              setShowWalletSettings(true);
            }
          : () => {
              setEnteredPrivateKey('');
              setError('');
              setShowImportWallet(true);
            }
      }
    />
  );
}

export default Wallet;
