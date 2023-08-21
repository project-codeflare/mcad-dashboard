import React from 'react';
import RefreshRateDropDown from '../DropDowns/refresh-rate-drop-down';
import '~/pages/MCADashboard/MCADashboard.css';
import TimeRangeDropDown from '~/pages/MCADashboard/DropDowns/time-range-drop-down';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import ApplicationsPage from '~/pages/ApplicationsPage';
import './Metrics.scss';
import McadMetricGraph from './McadMetricGraph';
import { convertRangeToTime } from './metrics-utils';
import { mcadPromQueries } from './queries';
import { Data } from '../types';
// import MetricGraph from './MetricGraph';
// import { Query, Unit } from './types';
// import { getMetricData, getMetricDataRange } from './api/metricsData';
// import MetricsCards from './MetricsCards';

// import QuotaTable from '../Tables/quota-table';
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

type MetricsProps = {
  activeTabKey: number;
};

const Resources: React.FC<MetricsProps> = ({ activeTabKey }: MetricsProps): React.ReactElement => {
  const [refreshRate, setRefreshRate] = React.useState<number>(30000);
  const [span, setSpan] = React.useState<string>('30m');
  const [validNamespaces, setValidNamespaces] = React.useState<Set<string>>();
  const handleRefreshSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

  const handleTimeRangeSelection = (item: string) => {
    setSpan(item);
  };

  React.useEffect(() => {
    const getValidNamespaces = async () => {
      const namespacesFromStorage = sessionStorage.getItem('valid-namespaces');
      if (namespacesFromStorage) {
        setValidNamespaces(new Set<string>(JSON.parse(namespacesFromStorage)));
      }
    };

    getValidNamespaces();

    window.addEventListener('data_stored', getValidNamespaces);

    return () => {
      window.removeEventListener('data_stored', getValidNamespaces);
    };
  }, []);

  const { components, loaded, loadError } = useWatchComponents(true);
  const isEmpty = !components || components.length === 0;

  const [data, setData] = React.useState<Data>(emptyDataObject);

  const getData = () => {
    const dataFromStorage = sessionStorage.getItem('appwrapper-data');
    if (dataFromStorage) {
      try {
        const parsedData = JSON.parse(dataFromStorage);
        if (parsedData.appwrappers && parsedData.stats) {
          setData(parsedData);
        }
      } catch (err) {
        console.log('ERROR Pulling Data from local storage');
      }
    }
  };

  React.useEffect(() => {
    getData();
  }, [refreshRate]);

  React.useEffect(() => {
    const handleStorageChange = () => {
      getData();
    };

    window.addEventListener('data_stored', handleStorageChange);

    return () => {
      window.removeEventListener('data_stored', handleStorageChange);
    };
  }, []);

  return (
    <>
      <ApplicationsPage
        title={undefined}
        description={undefined}
        loaded={loaded}
        empty={isEmpty}
        loadError={loadError}
      >
        <div className="dropdowns-container">
          <RefreshRateDropDown onSelected={handleRefreshSelection} />
          <div className="spacer" />
          <TimeRangeDropDown
            onSelected={handleTimeRangeSelection}
            dateFormatter={convertRangeToTime}
          />
        </div>
        {mcadPromQueries.map((query, index) => {
          return (
            <McadMetricGraph
              key={index}
              query={query}
              time={span}
              activeTabKey={activeTabKey}
              refreshRate={refreshRate}
              validNamespaces={validNamespaces}
            />
          );
        })}
      </ApplicationsPage>
    </>
  );
};

export default Resources;
