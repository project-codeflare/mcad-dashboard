import React from 'react';
import RefreshRateDropDown from '../MCADashboard/DropDowns/refresh-rate-drop-down';
import { getMetricData, getMetricDataRange } from '~/api/k8s/metricsData';
import MetricsCards from './MetricsCards';
import '../MCADashboard/MCADashboard.css';
import './Metrics.scss';
import MetricGraph from './MetricGraph';
import { useAppSelector } from '~/redux/hooks';
import { useWatchConsoleLinks } from '~/utilities/useWatchConsoleLinks';
import { ODH_PRODUCT_NAME } from '~/utilities/const';
import { getOpenShiftConsoleServerURL } from '~/utilities/clusterUtils';
import { useClusterInfo } from '~/redux/selectors/clusterInfo';
import { useAppContext } from '../../app/AppContext';

type MetricsProps = {
  activeTabKey: number;
};

const Metrics: React.FC<MetricsProps> = ({ activeTabKey }: MetricsProps): React.ReactElement => {
  const [refreshRate, setRefreshRate] = React.useState(30000);
  const handleSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

  const state = useAppSelector((state) => state);
  const links = useWatchConsoleLinks();
  const config = useAppContext();
  const data = useClusterInfo();
  console.log(data);
  console.log(state);
  console.log(links);
  console.log(config);

  return (
    <>
      <div className="dropdowns-container">
        <RefreshRateDropDown onSelected={handleSelection} />
        <div className="spacer" />
        {/* <TimeRangeDropDown /> */}
      </div>
      <MetricsCards />
      <MetricGraph
        name={'CPU Usage'}
        query={
          'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""}) by (namespace)'
        }
        time={'5m'}
        activeTabKey={activeTabKey}
      />
    </>
  );
};

export default Metrics;
