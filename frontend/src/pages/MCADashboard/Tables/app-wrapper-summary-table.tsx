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

interface Repository {
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
  data: unfilteredProjects,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [selectedRepoName, setSelectedRepoName] = React.useState('');
  const [searchType, setSearchType] = React.useState<SearchType>(SearchType.NAME);
  const [search, setSearch] = React.useState('');
  const searchTypes = React.useMemo(() => Object.keys(SearchType), []);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const columns: SortableData<Repository>[] = [
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

  const repositories: Repository[] = [];
  for (const appWrapper of Object.values(unfilteredProjects.appwrappers)) {
    const { metadata, status } = appWrapper;
    const repository: Repository = {
      name: metadata.name,
      namespace: metadata.namespace,
      createdon: metadata.creationTimestamp,
      age: metadata.calculatedTimeSpent,
      priority: status.systempriority.toString(),
      state: status.state,
      timesreenqueued: status.numRequeuings.toString(),
      latestmessage: status.constructed_message,
    };
    repositories.push(repository);
  }

  const sort = useTableColumnSort<Repository>(columns, 0);

  const filteredRepositories = sort.transformData(repositories).filter((repository) => {
    if (!search) {
      return true;
    }

    switch (searchType) {
      case SearchType.NAME:
        return repository.name.toLowerCase().includes(search.toLowerCase());
      case SearchType.NAMESPACE:
        return repository.namespace.toLowerCase().includes(search.toLowerCase());
      case SearchType.CREATEDON:
        return repository.createdon.toLowerCase().includes(search.toLowerCase());
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
        {/* <Gallery maxWidths={{ default: '330px' }} role="list" hasGutter>
            {components.map((c) => (
              <OdhAppCard key={c.metadata.name} odhApp={c} />
            ))}
          </Gallery> */}
        <Table
          aria-label="Appwrapper Summary"
          variant="compact"
          enablePagination
          data={filteredRepositories}
          columns={columns}
          emptyTableView={<>No projects match your filters. </>}
          rowRenderer={(repository) => (
            <Tr
              key={repository.name}
              onRowClick={() => setSelectedRepoName(repository.name)}
              isSelectable
              isHoverable
              isRowSelected={selectedRepoName === repository.name}
            >
              <Td dataLabel={repository.name}>{repository.name}</Td>
              <Td dataLabel={repository.namespace}>{repository.namespace}</Td>
              <Td dataLabel={repository.createdon}>{repository.createdon}</Td>
              <Td dataLabel={repository.age}>{repository.age}</Td>
              <Td dataLabel={repository.priority}>{repository.priority}</Td>
              <Td dataLabel={repository.state}>{repository.state}</Td>
              <Td dataLabel={repository.timesreenqueued}>{repository.timesreenqueued}</Td>
              <Td dataLabel={repository.latestmessage}>{repository.latestmessage}</Td>
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
