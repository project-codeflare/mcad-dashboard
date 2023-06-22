import * as React from 'react';
import {
  ToolbarItem,
  PageSection,
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { SortableData } from '../components/table/useTableColumnSort';
import Table from '../components/table/Table';
import { Data } from '../types';
import SearchFieldAppwrappers, { SearchType } from './SearchFieldAppwrappers';
import useTableColumnSort from '../components/table/useTableColumnSort';

interface QuotaData {
  namespace: string;
  numberofappwrappers: number;
  // cpusage: number;
  // memoryusage: number;
  // cpurequests: number;
  // memoryrequests: number;
  // cpulimits: number;
  // memorylimits: number;
}

interface NameSpaceCount {
  namespace: string;
  numberofappwrappers: number;
}

type QuotaViewProps = {
  data: Data;
};

export const QuotaTable: React.FunctionComponent<QuotaViewProps> = ({
  data: Data,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [selectedRepoName, setSelectedRepoName] = React.useState('');
  const [searchType, setSearchType] = React.useState<SearchType>(SearchType.NAME);
  const [search, setSearch] = React.useState('');
  const searchTypes = React.useMemo(() => Object.keys(SearchType), []);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const columns: SortableData<QuotaData>[] = [
    {
      field: 'namespace',
      label: 'Namespace',
      sortable: true,
    },
    {
      field: 'numberofappwrappers',
      label: '# of Appwrappers',
      sortable: true,
    },
    {
      field: 'cpusage',
      label: 'CPU Usage',
      sortable: true,
    },
    {
      field: 'memoryusage',
      label: 'Memory Usage',
      sortable: true,
    },
    {
      field: 'cpurequests',
      label: 'CPU Requests',
      sortable: false,
    },
    {
      field: 'memoryrequests',
      label: 'Memory Requests',
      sortable: false,
    },
    {
      field: 'cpulimits',
      label: 'CPU Limits',
      sortable: false,
    },
    {
      field: 'memorylimits',
      label: 'Memory Limits',
      sortable: false,
    },
  ];
  const appwrapperSummaryData: QuotaData[] = [];
  for (const appWrapper of Object.values(Data.appwrappers)) {
    const { metadata } = appWrapper;
    const quota: QuotaData = {
      namespace: metadata.namespace,
      numberofappwrappers: 1,
      // cpusage: metadata.namespace,
      // memoryusage: metadata.namespace,
      // cpurequests: metadata.namespace,
      // memoryrequests: metadata.namespace,
      // cpulimits: metadata.namespace,
      // memorylimits: metadata.namespace,
    };
    appwrapperSummaryData.push(quota);
  }

  const namespaceCounts: { [key: string]: number } = {};
  for (const appwrapper of Object.values(Data.appwrappers)) {
    const namespace = appwrapper.metadata.namespace;
    if (namespace in namespaceCounts) {
      namespaceCounts[namespace]++;
    } else {
      namespaceCounts[namespace] = 1;
    }
  }
  const appwrappersInNamespace = Object.entries(namespaceCounts).map(([namespace, count]: [string, number]) => ({
    namespace,
    numberofappwrappers: count,
  }));

  console.log("appwrappersInNamespace", appwrappersInNamespace)

  const sort = useTableColumnSort<QuotaData>(columns, 0);

  const filteredAppwrapperSummaryData = sort
    .transformData(appwrapperSummaryData)
    .filter((appwrapper) => {
      if (!search) {
        return true;
      }

      switch (searchType) {
        case SearchType.NAMESPACE:
          return appwrapper.namespace.toLowerCase().includes(search.toLowerCase());
        default:
          return true;
      }
    });

  return (
    <ExpandableSection
      displaySize={'large'}
      onToggle={onToggle}
      isExpanded={isExpanded}
      toggleContent={
        <div>
          <TextContent>
            <Text component={TextVariants.h2}>Appwrapper Quota Summary</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <Table
          aria-label="Appwrapper Quota Summary"
          variant="compact"
          enablePagination
          data={appwrappersInNamespace}
          columns={columns}
          emptyTableView={<>No namespaces match your filters. </>}
          rowRenderer={(appwrappersInNamespace) => (
            <Tr
              key={appwrappersInNamespace.namespace}
              onRowClick={() => setSelectedRepoName(appwrappersInNamespace.namespace)}
              isSelectable
              isHoverable
              isRowSelected={selectedRepoName === appwrappersInNamespace.namespace}
            >
              <Td dataLabel={appwrappersInNamespace.namespace}>{appwrappersInNamespace.namespace}</Td>
              <Td dataLabel={appwrappersInNamespace.numberofappwrappers.toString()}>{appwrappersInNamespace.numberofappwrappers.toString()}</Td>
            </Tr>
          )}
          toolbarContent={
            <React.Fragment>
              <ToolbarItem>
                <SearchFieldAppwrappers
                  types={searchTypes}
                  searchType={searchType}
                  searchValue={search}
                  onSearchTypeChange={(searchType) => {
                    setSearchType(searchType);
                  }}
                  onSearchValueChange={(searchValue) => {
                    setSearch(searchValue);
                  }}
                />
              </ToolbarItem>
            </React.Fragment>
          }
        />
      </PageSection>
    </ExpandableSection>
  );
};

export default QuotaTable;
