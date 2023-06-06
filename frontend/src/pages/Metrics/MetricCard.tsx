import React from 'react';

import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

const MetricCard = ({ data: num, name: dataName }) => {
  return (
    <Card className="metric-card">
      <CardHeader className="metric-card-header">Cpu Utilization</CardHeader>
      <CardBody className="metric-card-data">{num}%</CardBody>
    </Card>
  );
};

export default MetricCard;
