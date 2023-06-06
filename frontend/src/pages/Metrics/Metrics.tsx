import React, { useState, useEffect } from 'react';
import RefreshRateDropDown from '../MCADashboard/DropDowns/refresh-rate-drop-down';

import MetricsTyles from './MetricsCards';
import '../MCADashboard/MCADashboard.css';
import './Metrics.css';
import MetricGraph from './MetricGraph';

const getMetricsData = () => {
  const data = {
    cpuUtilization: 43,
    cpuLimit: 24.3,
  };
  return data;
};

const Metrics = () => {
  const [refreshRate, setRefreshRate] = React.useState(30000);
  const handleSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

  const [metricsData, setMetricsData] = React.useState({});
  React.useEffect(() => {
    const getData = async () => {
      const data = await getMetricsData();
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
