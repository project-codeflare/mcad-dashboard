import React from 'react';

import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { getMetricData } from '~/api/k8s/metricsData';
import { QueryReturnType } from './types';
import { formatData } from './metrics-utils';

type MetricCardProps = {
  name: string;
  query: string;
  queryReturnType: QueryReturnType;
};

const MetricCard: React.FC<MetricCardProps> = ({
  name,
  query,
  queryReturnType,
}: MetricCardProps): React.ReactElement => {
  const [percentage, setPercentage] = React.useState(0.0);

  React.useEffect(() => {
    const getData = async () => {
      const data = await getMetricData(query);
      setPercentage(formatData(data.data, queryReturnType));
    };

    getData();
  }, []);

  return (
    <Card className="metric-card">
      <CardHeader className="metric-card-header">{name}</CardHeader>
      <CardBody className="metric-card-data">
        {Math.round(percentage * 100) / 100}
        {queryReturnType === QueryReturnType.PERCENT && '%'}
      </CardBody>
    </Card>
  );
};

export default MetricCard;
