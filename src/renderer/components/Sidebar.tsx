import { Box, Button, Sidebar as GrommetSidebar, Image, Nav } from 'grommet';
import { Home, Money, Tools } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';

function Sidebar() {
  const navigate = useNavigate();

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
          plain
          label="Dashboard"
          icon={<Home size="medium" />}
          hoverIndicator="#F2F6FF"
        />
        <Button
          onClick={() => navigate('/train')}
          plain
          label="Train"
          icon={<Tools size="medium" />}
          hoverIndicator="#F2F6FF"
        />
        <Button
          onClick={() => navigate('/faucet')}
          plain
          label="Faucet"
          icon={<Money size="medium" />}
          hoverIndicator="#F2F6FF"
        />
      </Nav>
    </GrommetSidebar>
  );
}

export default Sidebar;
