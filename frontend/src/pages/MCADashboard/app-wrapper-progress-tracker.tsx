import * as React from 'react';
import {
  ToolbarItem,
  PageSection,
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
  ProgressStepper,
  ProgressStep,
  ContextSelector,
  ContextSelectorItem
} from '@patternfly/react-core';
import PendingIcon from '@patternfly/react-icons/dist/esm/icons/pending-icon';
import useTableColumnSort from '~/pages/MCADashboard/components/table/useTableColumnSort';
import { SortableData } from '~/pages/MCADashboard/components/table/useTableColumnSort';
import { Data } from '~/pages/MCADashboard/types';
import SearchFieldAppwrappers, { SearchType } from './Tables/SearchFieldAppwrappers';


interface AppWrapperStateData {
  name: string;
  namespace: string;
  state: string;
}

type AppWrapperViewProps = {
  data: Data;
};

export const AppWrapperProgressTracker: React.FunctionComponent<AppWrapperViewProps> = ({
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

  const appwrapperStateData: AppWrapperStateData[] = [];
  const appwrapperNameData: string[] = [];
  for (const appWrapper of Object.values(Data.appwrappers)) {
    const { metadata, status } = appWrapper;
    const repository: AppWrapperStateData = {
      name: metadata.name,
      namespace: metadata.namespace,
      state: status.state,
    };
    appwrapperStateData.push(repository);
    appwrapperNameData.push(metadata.name);
  }
  
  const firstItemText = "Select an Appwrapper";
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(firstItemText);
  const [searchValue, setSearchValue] = React.useState('');
  const [filteredItems, setFilteredItems] = React.useState(appwrapperNameData);

  const onToggleDropDown = (event: any, isOpen: boolean) => {
    setOpen(isOpen);
  };

  const onSelectDropDown = (event: any, value: React.ReactNode) => {
    setSelected(value as string);
    setOpen(!isOpen);
  };

  const onSearchInputChangeDropDown = (value: string) => {
    setSearchValue(value);
  };

  const onSearchButtonClickDropDown = () => {
    const filtered =
      searchValue === ''
        ? appwrapperNameData
        : appwrapperNameData.filter(item => {
            const str = typeof item === 'string' ? item : item;
            return str.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
          });

    setFilteredItems(filtered || []);
  };

  

  return (
    <ExpandableSection
      displaySize={'large'}
      onToggle={onToggle}
      isExpanded={isExpanded}
      toggleContent={
        <div>
          <TextContent>
            <Text component={TextVariants.h2}>Appwrapper Progress Tracker</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <div className='progress-tracker-appwrapper-dropdown'>
          <ContextSelector
            toggleText={selected}
            onSearchInputChange={onSearchInputChangeDropDown}
            isOpen={isOpen}
            searchInputValue={searchValue}
            onToggle={onToggleDropDown}
            onSelect={onSelectDropDown}
            onSearchButtonClick={onSearchButtonClickDropDown}
            screenReaderLabel="Selected Appwrapper:"
          >
            {filteredItems.map((item, index) => {
              const [text = null, href = undefined, isDisabled] =
                typeof item === 'string' ? [item, undefined, false] : [item];
              return (
                <ContextSelectorItem key={index} href={href} isDisabled={isDisabled}>
                  {text}
                </ContextSelectorItem>
              );
            })}
          </ContextSelector>
        </div>
        <div>
          <ProgressStepper aria-label="Appwrapper progress tracker">
            <ProgressStep
              variant="success"
              id="submitted"
              titleId="submitted"
              aria-label="submitted"
            >
              Submitted
            </ProgressStep>
            <ProgressStep
              variant="success"
              id="pending"
              titleId="pending"
              aria-label="pending"
            >
              Pending
            </ProgressStep>
            <ProgressStep
              variant="info"
              isCurrent
              id="running"
              titleId="running"
              aria-label="running"
            >
              Running
            </ProgressStep>
            <ProgressStep
              variant="pending"
              icon={<PendingIcon />}
              id="queued"
              titleId="queued"
              aria-label="queued"
            >
              Queued
            </ProgressStep>
            <ProgressStep
              variant="danger"
              id="failed"
              titleId="failed"
              aria-label="failed"
            >
              Failed
            </ProgressStep>
            <ProgressStep
              variant="pending"
              id="completed"
              titleId="completed"
              aria-label="completed"
            >
              Completed
            </ProgressStep>
          </ProgressStepper>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default AppWrapperProgressTracker;
