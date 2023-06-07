import React from 'react';

import {
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
  PageSection,
  Gallery,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import {
  Chart,
  ChartVoronoiContainer,
  ChartAxis,
  ChartLine,
  ChartGroup,
} from '@patternfly/react-charts';

import { getMetricDataRange } from '~/api/k8s/metricsData';

type MetricGraphProps = {
  name: string;
  query: string;
  time: string;
};

type MetricData = {
  metric: { namespace: string };
  values: [number, string][];
};

const MetricGraph: React.FC<MetricGraphProps> = ({
  name,
  query,
  time,
}: MetricGraphProps): React.ReactElement => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const [metricData, setMetricData] = React.useState<MetricData>();

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  React.useEffect(() => {
    const getData = async () => {
      const response = await getMetricDataRange(query, time);
      const data: MetricData = response.data;
      setMetricData(data);
    };

    getData();
  }, []);

  React.useEffect(() => {
    console.log(metricData ? metricData[0] : 'none');
  }, [metricData]);

  return (
    <ExpandableSection
      displaySize={'large'}
      onToggle={onToggle}
      isExpanded={isExpanded}
      toggleContent={
        <div>
          <TextContent>
            <Text component={TextVariants.h2}>Example graph</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <Chart
          ariaDesc="Average number of pets"
          ariaTitle="Line chart example"
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => `${datum.x}: ${datum.y}`}
              constrainToVisibleArea
            />
          }
          legendData={[{ name: 'Cats' }]}
          legendOrientation="vertical"
          legendPosition="right"
          height={250}
          maxDomain={{ y: 1 }}
          minDomain={{ y: 0 }}
          name="chart1"
          padding={{
            bottom: 50,
            left: 50,
            right: 200, // Adjusted to accommodate legend
            top: 50,
          }}
          width={600}
        >
          <ChartAxis tickFormat={(tick) => new Date(tick * 1000).toLocaleString()} />
          <ChartAxis dependentAxis showGrid tickFormat={(tick) => Number(tick).toFixed(2)} />
          <ChartGroup>
            <ChartLine
              data={
                metricData
                  ? metricData[0].values.map(([timestamp, value]) => ({
                      x: timestamp,
                      y: Number(value),
                    }))
                  : null
              }
            />
          </ChartGroup>
        </Chart>
      </PageSection>
    </ExpandableSection>
  );
};

export default MetricGraph;
