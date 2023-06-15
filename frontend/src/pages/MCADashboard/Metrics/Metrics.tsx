import React from 'react';
import RefreshRateDropDown from '../DropDowns/refresh-rate-drop-down';
import { getMetricData, getMetricDataRange } from '~/api/k8s/metricsData';
import MetricsCards from './MetricsCards';
import '../MCADashboard.css';
import './Metrics.scss';
import MetricGraph from './MetricGraph';
import TimeRangeDropDown from './time-range-dropdown';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import ApplicationsPage from '../../ApplicationsPage';

type MetricsProps = {
  activeTabKey: number;
};

const Metrics: React.FC<MetricsProps> = ({ activeTabKey }: MetricsProps): React.ReactElement => {
  const [refreshRate, setRefreshRate] = React.useState<number>(30000);
  const [span, setSpan] = React.useState<string>('2w');
  const handleRefreshSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

  const handleTimeRangeSelection = (item: string) => {
    setSpan(item);
  };

  const { components, loaded, loadError } = useWatchComponents(true);
  const isEmpty = !components || components.length === 0;

  const convertRangeToTime = (timeRange: string) => {
    switch (timeRange) {
      case 'Custom Time Range':
        return '5m';
      case 'Last 5 minutes':
        return '5m';
      case 'Last 10 minutes':
        return '10m';
      case 'Last 30 minutes':
        return '30m';
      case 'Last 1 hour':
        return '1h';
      case 'Last 2 hours':
        return '2h';
      case 'Last 1 day':
        return '1d';
      case 'Last 2 days':
        return '2d';
      case 'Last 1 week':
        return '1w';
      case 'Last 2 weeks':
        return '2w';
      default:
        throw new Error('invalid input');
    }
  };

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
        <MetricsCards />
        <MetricGraph
          name={'CPU Usage'}
          query={
            'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""}) by (namespace)'
          }
          time={span}
          activeTabKey={activeTabKey}
        />
      </ApplicationsPage>
    </>
  );
};

export default Metrics;
