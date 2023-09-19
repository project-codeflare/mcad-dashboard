import * as React from 'react';
import * as _ from 'lodash';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import { OdhApplication } from '~/types';
import ApplicationsPage from '~/pages/ApplicationsPage';
import QuickStarts from '~/app/QuickStarts';
import { fireTrackingEvent } from '~/utilities/segmentIOUtils';
import { useUser } from '~/redux/selectors';
import AppWrapperSummaryTable from './Tables/app-wrapper-summary-table';
import StatusSummaryTable from './Tables/status-summary-table';
// import TimeRangeDropDown from './DropDowns/time-range-drop-down';
import RefreshRateDropDown from './DropDowns/refresh-rate-drop-down';
import './MCADashboard.css';
import { getAppwrappers} from './app-wrapper-data';
import { Data } from './types';
import MetricsCards from './Metrics/MetricsCards';
import DonutMetricsCards from './Metrics/DonutMetricsCards';
// import { convertRangeToTime } from './Metrics/metrics-utils';
import { availableResourceQueries, totalResourceQueries } from './Metrics/queries';
import { getNamespacesFromAppwrappers } from './Metrics/metrics-utils';

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
    const { isAdmin } = useUser();
    const isEmpty = !components || components.length === 0;
    // const [span, setSpan] = React.useState<string>('30m');
    const [refreshRate, setRefreshRate] = React.useState(30000);
    const handleSelection = (selectedItemId: number) => {
      setRefreshRate(selectedItemId);
    };

    // const handleTimeRangeSelection = (item: string) => {
    //   setSpan(item);
    // };

    const emptyDataObject: Data = {
      stats: {
        // initial values for the stats object
        statusCounts: {
          Dispatched: '-',
          Queued: '-',
          'Re-enqueued': '-',
          Failed: '-',
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
        const newData = await getAppwrappers();
        if (newData && newData.stats && newData.appwrappers) {
          setData(newData);
          sessionStorage.setItem('appwrapper-data', JSON.stringify(newData));
          sessionStorage.setItem(
            'valid-namespaces',
            JSON.stringify(getNamespacesFromAppwrappers(newData)),
          );

          window.dispatchEvent(new Event('data_stored'));
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
          {/* <div className="spacer" /> */}
          {/* <TimeRangeDropDown
            onSelected={handleTimeRangeSelection}
            dateFormatter={convertRangeToTime}
          /> */}
        </div>
        {isAdmin && (
          <div>
            <DonutMetricsCards
              totalQueries={totalResourceQueries}
              queries={availableResourceQueries}
              name={'Cluster Utilized/ Available Resources'}
              refreshRate={refreshRate}
            />
            {/* <MetricsCards
              queries={availableResourceQueries}
              name={'Cluster Available Resources'}
              refreshRate={refreshRate}
            /> */}
          </div>
        )}
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
