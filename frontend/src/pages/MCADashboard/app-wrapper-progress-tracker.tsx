import * as React from 'react';
import { useCallback } from 'react';
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
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import useTableColumnSort from '~/pages/MCADashboard/components/table/useTableColumnSort';
import { SortableData } from '~/pages/MCADashboard/components/table/useTableColumnSort';
import { Data } from '~/pages/MCADashboard/types';
import SearchFieldAppwrappers, { SearchType } from './Tables/SearchFieldAppwrappers';


interface AppWrapperStateData {
  name: string;
  namespace: string;
  state: string;
}

interface ProgressStep {
  variant: "pending" | "default" | "success" | "info" | "warning" | "danger" | undefined;
  isCurrent: boolean;
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
  const [selectedAppwrapper, setSelectedAppwrapper] = React.useState(firstItemText);
  const [searchValue, setSearchValue] = React.useState('');
  const [filteredItems, setFilteredItems] = React.useState(appwrapperNameData);

  const onToggleDropDown = (event: any, isOpen: boolean) => {
    setOpen(isOpen);
  };

  const onSelectDropDown = (event: any, value: React.ReactNode) => {
    setSelectedAppwrapper(value as string);
    setOpen(!isOpen);
  };

  const onSearchInputChangeDropDown = (value: string) => {
    setSearchValue(value);
  };

  const onSearchButtonClickDropDown = useCallback(() => {
    const filtered =
      searchValue === ''
        ? appwrapperNameData
        : appwrapperNameData.filter(item => {
          const str = typeof item === 'string' ? item : item;
          return str.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
        });

    setFilteredItems(filtered || []);
  }, [appwrapperNameData]);

  //onSearchButtonClickDropDown();
  let progressTrackerVariantUpdate: { [key: string]: ProgressStep } =
  {
    submitted: { variant: "pending", isCurrent: false },
    pending: { variant: "pending", isCurrent: false },
    running: { variant: "pending", isCurrent: false },
    failed: { variant: "pending", isCurrent: false },
    completed: { variant: "pending", isCurrent: false }
  };
  // Find the selected appwrapper in the appwrapperStateData array
  const selectedAppwrapperData = appwrapperStateData.find(appwrapper => appwrapper.name === selectedAppwrapper);
  if (selectedAppwrapperData) {
    // Update the state of the selected appwrapper based on its progress state
    const progressStep = progressTrackerVariantUpdate[selectedAppwrapperData.state.toLowerCase()];

    // submitted state
    if (selectedAppwrapperData.state.toLowerCase() === "") {
      progressTrackerVariantUpdate["submitted"].variant = "info";
      progressStep.isCurrent = true;
    }

    if (progressStep) {
      if (selectedAppwrapperData.state.toLowerCase() === "pending") { // queued state
        progressStep.variant = "info";
        progressStep.isCurrent = true;
        progressTrackerVariantUpdate["submitted"].variant = "success";
      } else if (selectedAppwrapperData.state.toLowerCase() === "running") { // running state
        progressStep.variant = "info";
        progressStep.isCurrent = true;
        progressTrackerVariantUpdate["submitted"].variant = "success";
        progressTrackerVariantUpdate["pending"].variant = "success";
      } else if (selectedAppwrapperData.state.toLowerCase() === "failed") { // failed state
        progressStep.variant = "danger";
        progressStep.isCurrent = true;
        progressTrackerVariantUpdate["submitted"].variant = "success";
      } else if (selectedAppwrapperData.state.toLowerCase() === "runningholdcompletion") { // completed with running pods
        progressStep.variant = "success";
        progressStep.isCurrent = true;
        progressTrackerVariantUpdate["submitted"].variant = "success";
        progressTrackerVariantUpdate["pending"].variant = "success";
        progressTrackerVariantUpdate["running"].variant = "success";
      }
    }
  }
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
            toggleText={selectedAppwrapper}
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
              variant={progressTrackerVariantUpdate.submitted.variant}
              isCurrent={progressTrackerVariantUpdate.submitted.isCurrent}
              id="submitted"
              titleId="submitted"
              aria-label="submitted"
            >
              Submitted
            </ProgressStep>
            <ProgressStep
              variant={progressTrackerVariantUpdate.pending.variant}
              isCurrent={progressTrackerVariantUpdate.pending.isCurrent}
              icon={<PendingIcon />}
              id="pending"
              titleId="pending"
              aria-label="pending"
            >
              Queued
            </ProgressStep>
            <ProgressStep
              variant={progressTrackerVariantUpdate.running.variant}
              isCurrent={progressTrackerVariantUpdate.running.isCurrent}
              id="running"
              titleId="running"
              aria-label="running"
            >
              Running
            </ProgressStep>
            <ProgressStep
              variant={progressTrackerVariantUpdate.failed.variant}
              isCurrent={progressTrackerVariantUpdate.failed.isCurrent}
              icon={<ExclamationCircleIcon />}
              id="failed"
              titleId="failed"
              aria-label="failed"
            >
              Failed
            </ProgressStep>
            <ProgressStep
              variant={progressTrackerVariantUpdate.completed.variant}
              isCurrent={progressTrackerVariantUpdate.completed.isCurrent}
              id="completed"
              titleId="completed"
              aria-label="completed"
            >
              Completed [With Running Pods]
            </ProgressStep>
          </ProgressStepper>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default AppWrapperProgressTracker;
