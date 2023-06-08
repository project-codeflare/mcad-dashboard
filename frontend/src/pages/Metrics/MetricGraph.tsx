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
import './Metrics.css';

type MetricGraphProps = {
  name: string;
  query: string;
  time: string;
  activeTabKey: number;
};

type MetricData = {
  metric: { namespace: string };
  values: [number, string][];
};

const MetricGraph: React.FC<MetricGraphProps> = ({
  name,
  query,
  time,
  activeTabKey,
}: MetricGraphProps): React.ReactElement => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const [metricData, setMetricData] = React.useState<MetricData[]>();
  const containerRef: any = React.useRef(null);
  const [width, setWidth] = React.useState<number>();
  const handleResize = () => {
    console.log('handling');
    if (containerRef.current && containerRef.current.clientWidth) {
      setWidth(containerRef.current.clientWidth);
    }
  };

  React.useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, activeTabKey]);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  React.useEffect(() => {
    const getData = async () => {
      const response = await getMetricDataRange(query, time);
      const data: MetricData[] = response.data;
      setMetricData(data);
    };

    getData();
  }, []);

  React.useEffect(() => {
    console.log(metricData);
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
        <div className="metric-graph" ref={containerRef}>
          <Chart
            ariaDesc="Average number of pets"
            ariaTitle="Line chart example"
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                constrainToVisibleArea
              />
            }
            legendOrientation="vertical"
            legendPosition="right"
            height={300}
            maxDomain={{ y: 1 }}
            minDomain={{ y: 0 }}
            name="chart1"
            padding={{
              bottom: 50,
              left: 50,
              right: 50,
              top: 50,
            }}
            width={width}
          >
            <ChartAxis
              tickCount={6}
              tickFormat={(tick) =>
                new Date(tick * 1000).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })
              }
            />
            <ChartAxis dependentAxis showGrid tickFormat={(tick) => Number(tick).toFixed(2)} />
            <ChartGroup>
              {metricData ? (
                metricData.map((obj, index) => {
                  return (
                    <ChartLine
                      data={metricData[index].values.map(([timestamp, value]) => ({
                        x: timestamp,
                        y: Number(value),
                      }))}
                    />
                  );
                })
              ) : (
                <></>
              )}
            </ChartGroup>
          </Chart>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default MetricGraph;
