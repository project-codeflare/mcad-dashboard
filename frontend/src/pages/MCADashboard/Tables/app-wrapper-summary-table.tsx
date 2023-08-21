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
import useTableColumnSort from '~/pages/MCADashboard/components/table/useTableColumnSort';
import { SortableData } from '~/pages/MCADashboard/components/table/useTableColumnSort';
import Table from '~/pages/MCADashboard/components/table/Table';
import { Data } from '~/pages/MCADashboard/types';
import SearchFieldAppwrappers, { SearchType } from './SearchFieldAppwrappers';


interface AppWrapperSummaryData {
  name: string;
  namespace: string;
  createdon: string;
  age: string;
  priority: string;
  state: string;
  timesreenqueued: string;
  latestmessage: string;
}

type AppWrapperViewProps = {
  data: Data;
};

export const AppWrapperSummaryTable: React.FunctionComponent<AppWrapperViewProps> = ({
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

  const columns: SortableData<AppWrapperSummaryData>[] = [
    {
      field: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      field: 'namespace',
      label: 'Namespace',
      sortable: true,
    },
    {
      field: 'createdon',
      label: 'Created On',
      sortable: true,
    },
    {
      field: 'age',
      label: 'Age',
      sortable: true,
    },
    {
      field: 'priority',
      label: 'Priority',
      sortable: true,
    },
    {
      field: 'state',
      label: 'State',
      sortable: false,
    },
    {
      field: 'timesreenqueued',
      label: 'Times Re-enqueued',
      sortable: false,
    },
    {
      field: 'latestmessage',
      label: 'Latest Message',
      sortable: false,
    },
  ];

  const appwrapperSummaryData: AppWrapperSummaryData[] = [];
  for (const appWrapper of Object.values(Data.appwrappers)) {
    const { metadata, status } = appWrapper;
    const repository: AppWrapperSummaryData = {
      name: metadata.name,
      namespace: metadata.namespace,
      createdon: metadata.creationTimestamp,
      age: metadata.calculatedTimeSpent,
      priority: status.systempriority.toString(),
      state: status.state,
      timesreenqueued: status.numRequeuings.toString(),
      latestmessage: status.constructedMessage,
    };
    appwrapperSummaryData.push(repository);
  }

  const sort = useTableColumnSort<AppWrapperSummaryData>(columns, 0);

  const filteredAppwrapperSummaryData = sort
    .transformData(appwrapperSummaryData)
    .filter((appwrapper) => {
      if (!search) {
        return true;
      }

      switch (searchType) {
        case SearchType.NAME:
          return appwrapper.name.toLowerCase().includes(search.toLowerCase());
        case SearchType.NAMESPACE:
          return appwrapper.namespace.toLowerCase().includes(search.toLowerCase());
        case SearchType.CREATEDON:
          return appwrapper.createdon.toLowerCase().includes(search.toLowerCase());
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
            <Text component={TextVariants.h2}>Appwrapper Summary</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <Table
          aria-label="Appwrapper Summary"
          variant="compact"
          enablePagination
          data={filteredAppwrapperSummaryData}
          columns={columns}
          emptyTableView={<>No appwrappers match your filters. </>}
          rowRenderer={(appwrapperSummary) => (
            <Tr
              key={appwrapperSummary.name + appwrapperSummary.namespace}
              onRowClick={() => setSelectedRepoName(appwrapperSummary.name)}
              isSelectable
              isHoverable
              isRowSelected={selectedRepoName === appwrapperSummary.name}
            >
              <Td dataLabel={appwrapperSummary.name}>{appwrapperSummary.name}</Td>
              <Td dataLabel={appwrapperSummary.namespace}>{appwrapperSummary.namespace}</Td>
              <Td dataLabel={appwrapperSummary.createdon}>{appwrapperSummary.createdon}</Td>
              <Td dataLabel={appwrapperSummary.age}>{appwrapperSummary.age}</Td>
              <Td dataLabel={appwrapperSummary.priority}>{appwrapperSummary.priority}</Td>
              <Td dataLabel={appwrapperSummary.state}>{appwrapperSummary.state}</Td>
              <Td dataLabel={appwrapperSummary.timesreenqueued}>
                {appwrapperSummary.timesreenqueued}
              </Td>
              <Td dataLabel={appwrapperSummary.latestmessage}>{appwrapperSummary.latestmessage}</Td>
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

export default AppWrapperSummaryTable;
