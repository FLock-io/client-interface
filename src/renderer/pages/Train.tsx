import { useState } from 'react';
import Layout from 'renderer/components/Layout';
import Tasks from 'renderer/components/Tasks';

// interface FilterTagProps {
//   filter: string[];
//   filterAction: (item: string) => void;
// }

//filter tags props drilled down from top to be used across components

function Train() {
  const [filter, setFilter] = useState<string[]>([]);

  const filterAction = (item: string) => {
    if (filter.find((f) => f === item)) {
      setFilter(filter.filter((f) => f !== item));
    } else {
      setFilter([...filter, item]);
    }
  };

  return (
    <Layout filter={filter} filterAction={filterAction}>
      <Tasks sidebarFilters={filter} />
    </Layout>
  );
}

export default Train;
