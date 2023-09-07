import React from 'react';

import * as _ from 'lodash-es';

import { Unit } from './types';

import {
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
  PageSection,
  Spinner,
} from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartLine,
  ChartLegend,
  ChartGroup,
  ChartThemeColor,
} from '@patternfly/react-charts';

import { getMCADMetricDataRange } from './api/metricsData';
import './Metrics.scss';
import { MetricData, Query } from './types';
import { graphContainer } from './tooltip';
import { timeStringToSeconds, formatStringOnAxis } from './metrics-utils';

const LegendContainer = ({ children }: { children?: React.ReactNode }) => {
  // The first child should be a <rect> with a `width` prop giving the legend's content width
  const width = (React.Children.toArray(children)[0] as React.ReactElement)?.props?.width ?? '100%';
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
  validNamespaces?: Set<string>;
};

type LegendDataItem = {
  childName: string;
  name: string;
};

const formatSeriesValues = (values: any[], samples: number, span: number, unit?: Unit) => {
  const newValues = values;

  // The data may have missing values, so we fill those gaps with nulls so that the graph correctly
  // shows the missing values as gaps in the line
  // const start = Number(_.get(newValues, '[0].x'));
  // const end = Number(_.get(_.last(newValues), 'x'));
  // const step = span / 300;
  // _.range(start, end, step).forEach((t, i) => {
  //   const x = new Date(t);
  //   if (_.get(newValues, [i, 'x']) > x) {
  //     newValues.splice(i, 0, { x, y: null });
  //   }
  // });

  return newValues;
};

const McadMetricGraph: React.FC<MetricGraphProps> = ({
  query,
  time,
  activeTabKey,
  refreshRate,
  validNamespaces,
}: MetricGraphProps): React.ReactElement => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const [metricData, setMetricData] = React.useState<MetricData[]>();
  const containerRef = React.useRef<null | HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>();

  const getXDomain = (endTime: number, span: number) => [endTime - span, endTime];
  const [xDomain, setXDomain] = React.useState(
    getXDomain(Date.now(), timeStringToSeconds(time) * 1000),
  );

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

  const getMetricData = async () => {
    const response = await getMCADMetricDataRange(query.query, time);
    if (response.data) {
      const data: MetricData[] = response.data;
      setMetricData(data);
    }

  };

  React.useEffect(() => {
    setMetricData(undefined);
  }, [time]);

  React.useEffect(() => {
    getMetricData();
    setXDomain(getXDomain(Date.now() / 1000, timeStringToSeconds(time)));

    const interval = setInterval(async () => {
      setXDomain(getXDomain(Date.now() / 1000, timeStringToSeconds(time)));
      getMetricData();
    }, refreshRate);

    return () => clearInterval(interval);
  }, [time, validNamespaces, refreshRate]);
  const legendData: LegendDataItem[] = [];

  if (Array.isArray(metricData)) {
    metricData?.forEach((obj) => {
      const status = obj.metric.status ? obj.metric.status : obj.metric.appwrapper_name;
      // Check if the same status is already in legendData
      const alreadyExists = legendData.some(item => item.childName === status);
      if (!alreadyExists) {
        legendData.push({
          childName: status,
          name: status,
        });
      }
    });
  }
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
        <div
          className={metricData ? 'metric-graph-outer' : 'metric-graph-outer-loading'}
          ref={containerRef}
        >
          <Graph
            query={query}
            width={width}
            legendData={legendData}
            time={time}
            metricData={metricData}
            xDomain={xDomain}
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
  xDomain: any;
};

const Graph: React.FC<GraphProps> = ({
  query,
  width,
  legendData,
  time,
  metricData,
  xDomain,
}: GraphProps) => {
  if (!metricData) {
    return (
      <div className="graph-loading">
        <Spinner />
      </div>
    );
  }

  const [maxVal, setMaxVal] = React.useState<number>(0);

  const domain: any = { x: xDomain, y: undefined };
  const getMaxVal = (metricData: MetricData[]) => {
    let maxDataVal;
    let maxVal = 0;
    for (const data of metricData) {
      maxDataVal = _.maxBy(data.values, (item) => {
        return parseInt(item[1]);
      })?.[1];
      maxVal = Math.max(maxVal, Number(maxDataVal));
    }
    return maxVal;
  };
  const max = getMaxVal(metricData);
  if (max <= 0) {
    domain.y = [0, 1];
  }
  React.useEffect(() => {
    setMaxVal(getMaxVal(metricData));
  }, []);

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
          left: 20,
          right: 0,
          top: 0,
        }}
        scale={{ x: 'time', y: 'linear' }}
        domain={domain}
      >
        <ChartAxis
          tickCount={4}
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
        <ChartAxis
          crossAxis={false}
          dependentAxis
          showGrid
          tickFormat={(tick) => formatStringOnAxis(Number(tick), query.unit)}
          tickCount={4}
        />
        <ChartGroup>
          {Array.isArray(metricData) &&
            metricData?.map((obj, index) => {
              const style = {
                labels: { unit: query.unit, fill: '' },
              };
              return (
                <ChartLine
                  key={index}
                  name={obj.metric.status ? obj.metric.status : obj.metric.appwrapper_name}
                  data={formatSeriesValues(
                    metricData[index].values.map(([timestamp, value]) => ({
                      x: timestamp,
                      y: Number.isNaN(value) ? null : Number(value),
                    })),
                    0,
                    timeStringToSeconds(time),
                    query.unit
                  )}
                  style={style}
                />
              );
            })}
        </ChartGroup>
        {legendData && (
          <ChartLegend
            data={legendData}
            groupComponent={<LegendContainer />}
            gutter={30}
            itemsPerRow={4}
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

export default McadMetricGraph;
