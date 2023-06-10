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
  ChartAxis,
  ChartLine,
  ChartLegendTooltip,
  ChartLegend,
  createContainer,
  ChartGroup,
  ChartVoronoiContainer,
  ChartTooltip,
} from '@patternfly/react-charts';

import { getMetricDataRange } from '~/api/k8s/metricsData';
import './Metrics.scss';

const LegendContainer = ({ children }: { children?: React.ReactNode }) => {
  // The first child should be a <rect> with a `width` prop giving the legend's content width
  const width = children?.[0]?.[0]?.props?.width ?? '100%';
  return (
    <foreignObject height={75} width={'100%'} y={245}>
      <div className="monitoring-dashboards__legend-wrap horizontal-scroll">
        <svg width={width}>{children}</svg>
      </div>
    </foreignObject>
  );
};

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

  const legendData = metricData?.map((obj) => {
    return {
      childName: obj.metric.namespace,
      name: obj.metric.namespace,
    };
  });

  console.log(legendData);
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
        <div className="metric-graph-outer">
          <div className="metric-graph" ref={containerRef}>
            <Chart
              ariaDesc="Average number of pets"
              ariaTitle="Line chart example"
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) => `${datum.childName}: ${datum.y.toFixed(2)}`}
                  constrainToVisibleArea
                />
              }
              height={250}
              maxDomain={{ y: 1.5 }}
              minDomain={{ y: 0 }}
              name="chart1"
              padding={
                {
                  // bottom: 50,
                  // left: 50,
                  // right: 50,
                  // top: 50,
                }
              }
              width={width}
            >
              <ChartAxis
                tickCount={6}
                tickFormat={(tick) =>
                  new Date(tick * 1000).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                }
              />
              <ChartAxis dependentAxis showGrid tickFormat={(tick) => Number(tick).toFixed(2)} />
              <ChartGroup>
                {metricData ? (
                  metricData.map((obj, index) => {
                    return (
                      <ChartLine
                        name={obj.metric.namespace}
                        data={metricData[index].values.map(([timestamp, value]) => ({
                          x: timestamp,
                          y: Number(value),
                        }))}
                      />
                    );
                  })
                ) : (
                  <></> // CPU utilization, memory requests, appwrapper stuff
                )}
              </ChartGroup>
              {legendData && (
                <ChartLegend
                  data={legendData}
                  groupComponent={<LegendContainer />}
                  gutter={30}
                  itemsPerRow={3}
                  orientation="vertical"
                  style={{
                    labels: { fontSize: 11, fill: 'var(--pf-global--Color--100)' },
                  }}
                  symbolSpacer={4}
                />
              )}
            </Chart>
          </div>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default MetricGraph;
