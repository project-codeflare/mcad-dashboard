import React, { useState, useEffect } from 'react';

import MetricsTyles from './MetricsCards';

const getMetricsData = () => {
  const data = {
    cpuUtilization: 43,
    cpuLimit: 24.3,
  };
  return data;
};

const Metrics = () => {
  const [metricsData, setMetricsData] = useState({});
  useEffect(() => {
    const getData = async () => {
      const data = await getMetricsData();
      setMetricsData(data);
    };

    getData();
  }, []);
  useEffect(() => {
    console.log(metricsData);
  }, [metricsData]);

  return <MetricsTyles data={metricsData} />;
};

export default Metrics;
