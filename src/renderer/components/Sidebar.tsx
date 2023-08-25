import { Box, Button, Sidebar as GrommetSidebar, Image, Nav, Text } from 'grommet';
import { Home, Money, Tools } from 'grommet-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from './logo.png';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  return (
    <GrommetSidebar
      background="white"
      round="small"
      header={
        <Box width="xsmall">
          <Image src={logo} />
        </Box>
      }
      pad="large"
      elevation="small"
      align="center"
      justify="center"
    >
      <Nav gap="medium" align="start">
        <Button
          onClick={() => navigate('/')}
          primary={pathname === '/'}
          label="Dashboard"
          icon={<Home size="medium" />}
          hoverIndicator={pathname === '/' ? '' : '#F2F6FF'}
          pad={{ vertical: 'small', horizontal: 'medium' }}
          color={pathname === '/' ? 'brand' : 'white'}
          fill="horizontal"
          justify="start"
        />
        <Button
          onClick={() => navigate('/train')}
          primary={pathname === '/train'}
          label="Train"
          icon={<Tools size="medium" />}
          hoverIndicator={pathname === '/train' ? '' : '#F2F6FF'}
          pad={{ vertical: 'small', horizontal: 'medium' }}
          color={pathname === '/train' ? 'brand' : 'white'}
          fill="horizontal"
          justify="start"
        />
        <Button
          onClick={() => navigate('/faucet')}
          primary={pathname === '/faucet'}
          label="Faucet"
          icon={<Money size="medium" />}
          hoverIndicator={pathname === '/faucet' ? '' : '#F2F6FF'}
          pad={{ vertical: 'small', horizontal: 'medium' }}
          color={pathname === '/faucet' ? 'brand' : 'white'}
          fill="horizontal"
          justify="start"
        />
      </Nav>
    </GrommetSidebar>
  );
}

export default Sidebar;
