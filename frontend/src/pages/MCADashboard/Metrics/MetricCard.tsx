import React from 'react';

import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { getMetricData } from '~/api/k8s/metricsData';

import { Unit } from './types';

type MetricCardProps = {
  name: string;
  query: string;
  refreshRate: number;
  unit?: Unit;
};

const MetricCard: React.FC<MetricCardProps> = ({
  name,
  query,
  refreshRate,
  unit,
}: MetricCardProps): React.ReactElement => {
  const [percentage, setPercentage] = React.useState(0.0);

  React.useEffect(() => {
    const getData = async () => {
      const data = await getMetricData(query);
      setPercentage(Math.round(data.data * 100) / 100);
    };

    getData();

    const interval = setInterval(async () => {
      getData();
    }, refreshRate);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="metric-card">
      <CardHeader className="metric-card-header">{name}</CardHeader>
      <CardBody className="metric-card-data">
        {Math.round(percentage * 100) / 100}
        {unit}
      </CardBody>
    </Card>
  );
};

export default MetricCard;
