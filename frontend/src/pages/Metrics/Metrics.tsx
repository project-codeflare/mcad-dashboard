import React from 'react';
import RefreshRateDropDown from '../MCADashboard/DropDowns/refresh-rate-drop-down';
import { getMetricData } from '~/api/k8s/metricsData';
import MetricsTyles from './MetricsCards';
import '../MCADashboard/MCADashboard.css';
import './Metrics.css';
import MetricGraph from './MetricGraph';

const Metrics = () => {
  const [refreshRate, setRefreshRate] = React.useState(30000);
  const handleSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

  const [metricsData, setMetricsData] = React.useState({});
  React.useEffect(() => {
    const getData = async () => {
      const data = await getMetricData(
        'https://thanos-querier-openshift-monitoring.mcad-dev-us-south-1-bx2-4-d9216b613387d80bef1a9d1d5bfb1331-0000.us-south.containers.appdomain.cloud/api/v1/',
        'cluster:node_cpu:ratio_rate5m{cluster=""}',
      );
      setMetricsData(data);
    };

    getData();
  }, []);

  React.useEffect(() => {
    console.log(metricsData);
  }, [metricsData]);

  return (
    <>
      <div className="dropdowns-container">
        <RefreshRateDropDown onSelected={handleSelection} />
        <div className="spacer" />
        {/* <TimeRangeDropDown /> */}
      </div>
      <MetricsTyles data={metricsData} />
      <MetricGraph />
    </>
  );
};

export default Metrics;
