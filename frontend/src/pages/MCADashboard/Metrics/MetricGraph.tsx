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
  Tooltip,
  TooltipPosition,
  Spinner,
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
import fetchData from '../app-wrapper-data';
import { getAllAppwrapperNamespaces } from './metrics-utils';
import { MetricData, DataItems, Query } from './types';
import { graphContainer } from './tooltip';

const LegendContainer = ({ children }: { children?: React.ReactNode }) => {
  // The first child should be a <rect> with a `width` prop giving the legend's content width
  const width = children?.[0]?.[0]?.props?.width ?? '100%';
  return (
    <foreignObject height={75} width="100%" y={245}>
      <div className="monitoring-dashboards__legend-wrap horizontal-scroll">
        <svg width={width}>{children}</svg>
      </div>
    </foreignObject>
  );
};

type MetricGraphProps = {
  query: Query;
  time: string;
  activeTabKey: number;
  refreshRate: number;
};

const MetricGraph: React.FC<MetricGraphProps> = ({
  query,
  time,
  activeTabKey,
  refreshRate,
}: MetricGraphProps): React.ReactElement => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const [metricData, setMetricData] = React.useState<MetricData[]>();
  const containerRef = React.useRef<null | HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>();
  const handleResize = () => {
    if (containerRef.current && containerRef.current.clientWidth) {
      setWidth(containerRef.current.clientWidth);
    }
  };

  React.useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('sidebar_toggle', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('sidebar_toggle', handleResize);
    };
  }, [activeTabKey, containerRef]);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const getData = async () => {
    const [validNamespaces, response] = await Promise.all([
      getAllAppwrapperNamespaces(),
      getMetricDataRange(query.query, time),
    ]);

    if (response.data) {
      const data: MetricData[] = response.data;
      const filteredData = data.filter((data) => {
        return validNamespaces.has(data.metric.namespace);
      });
      setMetricData(filteredData);
    }
  };

  React.useEffect(() => {
    setMetricData([]);

    getData();
  }, [time]);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      getData();
    }, refreshRate);

    return () => clearInterval(interval);
  }, [refreshRate]);

  const legendData = metricData?.map((obj) => {
    return {
      childName: obj.metric.pod,
      name: obj.metric.pod,
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
            <Text component={TextVariants.h2}>{query.name}</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <div className="metric-graph-outer" ref={containerRef}>
          <Graph
            query={query}
            width={width}
            legendData={legendData}
            time={time}
            metricData={metricData}
          />
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

type GraphProps = {
  query: Query;
  width?: number;
  legendData?: { childName: string; name: string }[];
  time: string;
  metricData?: MetricData[];
};

const Graph: React.FC<GraphProps> = ({
  query,
  width,
  legendData,
  time,
  metricData,
}: GraphProps) => {
  if (!metricData || metricData.length === 0) {
    return (
      <div className="graph-loading">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="metric-graph">
      <Chart
        ariaDesc={query.name}
        ariaTitle={query.name}
        containerComponent={graphContainer}
        height={200}
        minDomain={{ y: 0 }}
        name={query.name}
        width={width}
        themeColor={ChartThemeColor.multiUnordered}
        domainPadding={{ y: 1 }}
        padding={{
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        }}
        scale={{ x: 'time', y: 'linear' }}
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
        <ChartAxis dependentAxis showGrid tickFormat={(tick) => tick} />
        <ChartGroup>
          {metricData?.map((obj, index) => {
            return (
              <ChartLine
                key={index}
                name={obj.metric.pod}
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
  );
};

export default MetricGraph;
