import { Box, Header as GrommetHeader, TextInput } from 'grommet';
import { Search } from 'grommet-icons';
import Wallet from './Wallet';

function Header() {
  return (
    <GrommetHeader
      round="small"
      direction="row"
      align="center"
      justify="between"
      background="#FFFFFF"
      height="xsmall"
      elevation="small"
      width="100%"
      pad="small"
    >
      <Box round="small" border background="#F2F6FF" width="large">
        <TextInput
          placeholder="Search task here"
          plain
          icon={<Search />}
          width="100%"
        />
      </Box>
      <Box width="medium">
        <Wallet />
      </Box>
    </GrommetHeader>
  );
}

export default Header;
