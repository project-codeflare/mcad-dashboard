import * as React from 'react';
import * as _ from 'lodash';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import { OdhApplication } from '~/types';
import ApplicationsPage from '~/pages/ApplicationsPage';
import QuickStarts from '~/app/QuickStarts';
import { fireTrackingEvent } from '~/utilities/segmentIOUtils';
import AppWrapperSummaryTable from './Tables/app-wrapper-summary-table';
import StatusSummaryTable from './Tables/status-summary-table';
import TimeRangeDropDown from './DropDowns/time-range-drop-down';
import RefreshRateDropDown from './DropDowns/refresh-rate-drop-down';
import './MCADashboard.css';
import fetchData from './app-wrapper-data';
import { Data } from './types';
import MetricsCards from './Metrics/MetricsCards';
import { availableResourceQueries } from './Metrics/queries';
//const description = `A Dashboard for Multi-Cluster App Dispatcher`;

type MCADashboardInnerProps = {
  loaded: boolean;
  loadError?: Error;
  components: OdhApplication[];
};

// use to record the current enabled components
let enabledComponents: OdhApplication[] = [];

export const MCADashboardInner: React.FC<MCADashboardInnerProps> = React.memo(
  ({ loaded, loadError, components }) => {
    const isEmpty = !components || components.length === 0;
    const [refreshRate, setRefreshRate] = React.useState(30000);
    const handleSelection = (selectedItemId: number) => {
      setRefreshRate(selectedItemId);
    };

    const emptyDataObject: Data = {
      stats: {
        // initial values for the stats object
        statusCounts: {
          Dispatched: '-',
          Queued: '-',
          'Re-enqueued': '-',
          Other: '-',
        },
      },
      appwrappers: {
        // initial values for the appwrappers object
      },
    };
    const [data, setData] = React.useState<Data>(emptyDataObject);

    React.useEffect(() => {
      const initialFetch = async () => {
        const newData = await fetchData();
        if (newData && newData.stats && newData.appwrappers) {
          setData(newData);
          sessionStorage.setItem('appwrapper-data', JSON.stringify(newData));
        }
      };

      const getData = () => {
        const dataFromStorage = sessionStorage.getItem('appwrapper-data');
        if (dataFromStorage) {
          try {
            const parsedData = JSON.parse(dataFromStorage);
            if (parsedData.appwrappers && parsedData.stats) {
              setData(parsedData);
            } else {
              initialFetch(); // fetch data
            }
          } catch (err) {
            initialFetch();
          }
        } else {
          initialFetch(); // fetch data
        }
      };

      getData();

      const interval = setInterval(async () => {
        initialFetch();
      }, refreshRate); // fetching data every X seconds after the inital fetch

      return () => clearInterval(interval);
    }, [refreshRate]);
    console.log('data', data);
    console.log('data', data);

    return (
      <ApplicationsPage
        title={undefined}
        description={undefined}
        loaded={loaded}
        empty={isEmpty}
        loadError={loadError}
      >
        <div className="dropdowns-container">
          <RefreshRateDropDown onSelected={handleSelection} />
          <div className="spacer" />
          <TimeRangeDropDown />
        </div>
        <MetricsCards
          queries={availableResourceQueries}
          name={'Cluster Available Resources'}
          refreshRate={refreshRate}
        />
        <StatusSummaryTable data={data ? data : emptyDataObject} />
        <AppWrapperSummaryTable data={data ? data : emptyDataObject} />
      </ApplicationsPage>
    );
  },
);
MCADashboardInner.displayName = 'MCADashboardInner';

const MCADashboard: React.FC = () => {
  const { components, loaded, loadError } = useWatchComponents(true);

  const sortedComponents = React.useMemo(
    () =>
      _.cloneDeep(components).sort((a, b) => a.spec.displayName.localeCompare(b.spec.displayName)),
    [components],
  );

  React.useEffect(() => {
    /*
     * compare the current enabled applications and new fetched enabled applications
     * fire an individual segment.io tracking event for every different enabled application
     */
    if (loaded && components.length) {
      _.difference(
        components.filter((component) => component.spec.isEnabled).map((c) => c.metadata.name),
        enabledComponents
          .filter((component) => component.spec.isEnabled)
          .map((c) => c.metadata.name),
      ).forEach((name) =>
        fireTrackingEvent('Application Enabled', {
          name,
        }),
      );
      enabledComponents = components;
    }
  }, [components, loaded]);

  return (
    <QuickStarts>
      <MCADashboardInner loaded={loaded} components={sortedComponents} loadError={loadError} />
    </QuickStarts>
  );
};

export default MCADashboard;
