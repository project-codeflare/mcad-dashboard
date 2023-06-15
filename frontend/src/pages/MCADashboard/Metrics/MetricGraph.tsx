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
  ChartThemeColor,
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

type DataItems = MetricData[];

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
    if (containerRef.current && containerRef.current.clientWidth) {
      setWidth(containerRef.current.clientWidth);
    }
  };

  const getMaxValue = (data: DataItems | undefined) => {
    if (!data) {
      return 0;
    }
    let maxValue = 0;

    for (const item of data) {
      const { values } = item;

      for (const [_, value] of values) {
        const parsedValue = parseFloat(value);
        if (parsedValue > maxValue) {
          maxValue = parsedValue;
        }
      }
    }

    return maxValue;
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
      if (response.data) {
        const data: MetricData[] = response.data;
        setMetricData(data);
      }
    };

    getData();
  }, [time]);

  const legendData = metricData?.map((obj) => {
    return {
      childName: obj.metric.namespace,
      name: obj.metric.namespace,
    };
  });

  return (
    <ExpandableSection
      displaySize={'large'}
      onToggle={onToggle}
      isExpanded={isExpanded}
      toggleContent={
        <div>
          <TextContent>
            <Text component={TextVariants.h2}>{name}</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <div className="metric-graph-outer" ref={containerRef}>
          <div className="metric-graph">
            <Chart
              ariaDesc={name}
              ariaTitle={name}
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) => `${datum.childName}: ${datum.y.toFixed(2)}`}
                  constrainToVisibleArea
                />
              }
              height={250}
              maxDomain={{ y: getMaxValue(metricData) }}
              minDomain={{ y: 0 }}
              name={name}
              width={width}
              themeColor={ChartThemeColor.multiUnordered}
            >
              <ChartAxis
                tickCount={6}
                tickFormat={(tick) =>
                  time.charAt(time.length - 1) === 'h' || time.charAt(time.length - 1) === 'm'
                    ? new Date(tick * 1000).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: 'numeric',
                      })
                    : new Date(tick * 1000).toLocaleDateString([], {
                        day: 'numeric',
                        month: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })
                }
              />
              <ChartAxis dependentAxis showGrid tickFormat={(tick) => Number(tick).toFixed(2)} />
              <ChartGroup>
                {metricData?.map((obj, index) => {
                  return (
                    <ChartLine
                      key={index}
                      name={obj.metric.namespace}
                      data={metricData[index].values.map(([timestamp, value]) => ({
                        x: timestamp,
                        y: Number(value),
                      }))}
                    />
                  );
                })}
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
