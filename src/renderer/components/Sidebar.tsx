import {
  Box,
  Button,
  Sidebar as GrommetSidebar,
  Image,
  Nav,
  Text,
} from 'grommet';
import { Home, Money, Tools, Scorecard, Chat, CreditCard } from 'grommet-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heading } from 'grommet';
import logo from './logo.png';

interface FilterTagProps {
  filter: string[];
  filterAction: (item: string) => void;
}

const cardColors = {
  'Large Language Model Finetuning': '#A4C0FF',
  NLP: '#E69FBD',
  'Time series prediction': '#D9D9D9',
  Classification: '#BDD4DA',
};

function Sidebar({ filter, filterAction }: FilterTagProps) {
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
      <Nav gap="medium" align="start" margin={{ bottom: 'medium' }}>
        <Button
          onClick={() => {
            navigate('/');
          }}
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
          onClick={() => {
            navigate('/train');
          }}
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
          onClick={() => {
            navigate('/faucet');
          }}
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

      {pathname === '/train' && (
        <Box overflow="auto">
          <Box gap="small" border="top">
            <Heading level="3">NLP</Heading>
            <Box
              border={{ color: 'black', size: 'small' }}
              round="small"
              pad="xsmall"
              background={filter.includes('NLP') ? cardColors['NLP'] : ''}
              direction="row"
              gap="small"
              align="center"
              onClick={() => {
                filterAction('NLP');
              }}
            >
              <Scorecard color="black" size="20px" />
              <Text weight="bold">NLP</Text>
            </Box>
            <Box
              border={{ color: 'black', size: 'small' }}
              round="small"
              pad="xsmall"
              background={
                filter.includes('Large Language Model Finetuning')
                  ? cardColors['Large Language Model Finetuning']
                  : ''
              }
              direction="row"
              gap="small"
              align="center"
              onClick={() => filterAction('Large Language Model Finetuning')}
            >
              <Chat color="black" size="20px" />
              <Text weight="bold">LLM Finetuning</Text>
            </Box>
          </Box>
          <Box gap="small">
            <Heading level="3">Finance</Heading>
            <Box
              border={{ color: 'black', size: 'small' }}
              round="small"
              pad="xsmall"
              direction="row"
              gap="small"
              align="center"
              onClick={() => filterAction('Credit Card Fraud Detection')}
            >
              <CreditCard color="black" size="20px" />
              <Text weight="bold">Credit Card Fraud Detection</Text>
            </Box>
            <Box
              border={{ color: 'black', size: 'small' }}
              round="small"
              pad="xsmall"
              background={
                filter.includes('Time series prediction')
                  ? cardColors['Time series prediction']
                  : ''
              }
              direction="row"
              gap="small"
              align="center"
              onClick={() => filterAction('Time series prediction')}
            >
              <CreditCard color="black" size="20px" />
              <Text weight="bold">Time series prediction</Text>
            </Box>
          </Box>
          <Box gap="small">
            <Heading level="3">Computer Vision</Heading>
            <Box
              border={{ color: 'black', size: 'small' }}
              round="small"
              pad="xsmall"
              background={
                filter.includes('Classification')
                  ? cardColors['Classification']
                  : ''
              }
              direction="row"
              gap="small"
              align="center"
              onClick={() => filterAction('Classification')}
            >
              <Image color="black" sizes="20px" />
              <Text weight="bold">Classification</Text>
            </Box>
          </Box>
        </Box>
      )}
    </GrommetSidebar>
  );
}

export default Sidebar;
