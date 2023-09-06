import { Box } from 'grommet';
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface FilterTagProps {
  filter: string[];
  filterAction: (item: string) => void;
}

function Layout({
  children,
  filter,
  filterAction,
}: FilterTagProps & { children: React.ReactNode }) {
  return (
    <Box background="#F8FAFB" direction="row" height="100vh" overflow="hidden">
      <Box pad="small" width="medium">
        <Sidebar filter={filter} filterAction={filterAction} />
      </Box>
      <Box pad="medium" width="100%" height="100%">
        <Header />
        <Box overflow="auto" height="100%">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
