import React from 'react';

import { Card, CardBody, CardHeader } from '@patternfly/react-core';
import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts';
import { getMetricData } from './api/metricsData';
import { convertBytesToBestUnit } from './metrics-utils';
import { Unit } from './types';

interface DataMap {
  [key: string]: [string, string];
}

type MetricCardProps = {
  totalClusterResources: DataMap;
  name: string;
  query: string;
  refreshRate: number;
  unit?: Unit;
};

const DonutMetricCard: React.FC<MetricCardProps> = ({
  totalClusterResources,
  name,
  query,
  refreshRate,
  unit,
}: MetricCardProps): React.ReactElement => {
  const [percentage, setPercentage] = React.useState(0.0);
  const [noGpu, setNoGpu] = React.useState('');

  const getData = async () => {
    const data = await getMetricData(query);
    if (data === 'No GPUs Detected') {
      setNoGpu(data);
    } else {
      setPercentage(Math.round(data * 100) / 100);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      getData();
    }, refreshRate);

    return () => clearInterval(interval);
  }, [refreshRate]);

  return (
    <Card className="metric-card">
      <CardHeader className="metric-card-header">{name}</CardHeader>
      <CardBody className="donut-metric-card">
        <ChartDonutThreshold
          ariaDesc={name}
          ariaTitle={name}
          constrainToVisibleArea
          data={[{ x: 'Warning at 60%', y: 60 }, { x: 'Danger at 90%', y: 90 }]}
          labels={({ datum }) => datum.x ? datum.x : null}
          name="donutChartMetrics"
          width={500}
        >
          <ChartDonutUtilization
            data={{
              x: name, y: (totalClusterResources[name] && totalClusterResources[name][0] !== '0')
                ? Math.round((percentage * 100) / Number(totalClusterResources[name][0]) * 100) / 100
                : 0
            }}
            labels={({ datum }) => datum.x ? `${datum.x}: ${datum.y}%` : null}
            subTitle={
              noGpu === ''
                ? (totalClusterResources[name]
                  ? (totalClusterResources[name][1] === 'B'
                    ? `of ${convertBytesToBestUnit(Number(totalClusterResources[name][0]))}`
                    : `of ${Math.round(Number(totalClusterResources[name][0]))} ${totalClusterResources[name][1]}`)
                  : 'of -')
                : `${noGpu}`}
            title={
              unit === Unit.PERCENT
                ? `${percentage}${unit}`
                : (unit === Unit.BYTES
                  ? `${convertBytesToBestUnit(percentage)}`
                  : `${percentage}`
                )
            }
            thresholds={[{ value: 60 }, { value: 90 }]}
          />
        </ChartDonutThreshold>
      </CardBody>
    </Card>
  );
};

export default DonutMetricCard;