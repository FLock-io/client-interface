import { Box } from 'grommet';
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box background="#F8FAFB" direction="row" height="100vh" overflow="hidden">
      <Box pad="small" width="medium">
        <Sidebar />
      </Box>
      <Box pad="medium" width="100%" height="100%">
        <Header />
        <Box overflow="scroll" height="100%">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
