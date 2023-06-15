import React from 'react';

import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { getMetricData } from '~/api/k8s/metricsData';

type MetricCardProps = {
  name: string;
  query: string;
};

const MetricCard: React.FC<MetricCardProps> = ({
  name,
  query,
}: MetricCardProps): React.ReactElement => {
  const [percentage, setPercentage] = React.useState(0.0);
  React.useEffect(() => {
    const getData = async () => {
      const data = await getMetricData(query);
      setPercentage(data.data);
    };

    getData();
  }, []);

  return (
    <Card className="metric-card">
      <CardHeader className="metric-card-header">{name}</CardHeader>
      <CardBody className="metric-card-data">{Math.round(percentage * 100) / 100}%</CardBody>
    </Card>
  );
};

export default MetricCard;
