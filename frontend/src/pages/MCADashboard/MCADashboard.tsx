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

    const [data, setData] = React.useState<Data>({
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
    });
    React.useEffect(() => {
      const initialFetch = async () => {
        const newData = await fetchData();
        setData(newData);
      };

      initialFetch(); // initial fetch

      const interval = setInterval(async () => {
        const newData = await fetchData();
        setData(newData);
        console.log('refrashRate: ', refreshRate);
      }, refreshRate); // fetching data every X seconds after the inital fetch

      return () => clearInterval(interval);
    }, [refreshRate]);
    console.log('data', data); // for debugging purposes

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
        <StatusSummaryTable data={data} />
        <AppWrapperSummaryTable data={data} />
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
