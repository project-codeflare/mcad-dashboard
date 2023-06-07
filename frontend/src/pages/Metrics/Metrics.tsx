import React from 'react';
import RefreshRateDropDown from '../MCADashboard/DropDowns/refresh-rate-drop-down';
import { getMetricData, getMetricDataRange } from '~/api/k8s/metricsData';
import MetricsCards from './MetricsCards';
import '../MCADashboard/MCADashboard.css';
import './Metrics.css';
import MetricGraph from './MetricGraph';

const Metrics: React.FC = (): React.ReactElement => {
  const [refreshRate, setRefreshRate] = React.useState(30000);
  const handleSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

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
      />
    </>
  );
};

export default Metrics;
