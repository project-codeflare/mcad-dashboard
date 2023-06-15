import { VictoryPortal } from 'victory-core';
import React from 'react';
import classNames from 'classnames';
import { ChartVoronoiContainer } from '@patternfly/react-charts';

const TOOLTIP_MAX_ENTRIES = 15;
const TOOLTIP_MAX_WIDTH = 400;
const TOOLTIP_MAX_HEIGHT = 400;
const TOOLTIP_MAX_LEFT_JUT_OUT = 85;
const TOOLTIP_MAX_RIGHT_JUT_OUT = 45;

type TooltipSeries = {
  color: string;
  name: string;
  total: number;
  value: string;
};

type TooltipProps = {
  activePoints?: { x: number; y: number; childName: string }[];
  center?: { x: number; y: number };
  height?: number;
  style?: any;
  width?: number;
  x?: number;
};
// For performance, use this instead of PatternFly's ChartTooltip or Victory VictoryTooltip
const Tooltip: React.FC<TooltipProps> = ({
  activePoints,
  center,
  height,
  style,
  width,
  x,
}: TooltipProps) => {
  const time = activePoints?.[0]?.x;

  // Don't show the tooltip if the cursor is too far from the active points (can happen when the
  // graph's timespan includes a range with no data)
  if (Math.abs(x! - center!.x) > width! / 15) {
    return null;
  }

  // Pick tooltip width and location (left or right of the cursor) to maximize its available space
  const spaceOnLeft = x! + TOOLTIP_MAX_LEFT_JUT_OUT;
  const spaceOnRight = width! - x! + TOOLTIP_MAX_RIGHT_JUT_OUT;
  const isOnLeft = spaceOnLeft > spaceOnRight;
  const tooltipMaxWidth = Math.min(isOnLeft ? spaceOnLeft : spaceOnRight, TOOLTIP_MAX_WIDTH);

  const sortedActivePoints = activePoints!.sort((a, b) => b.y - a.y);
  const allSeries = sortedActivePoints.slice(0, TOOLTIP_MAX_ENTRIES);

  return (
    <>
      <VictoryPortal>
        <foreignObject
          height={TOOLTIP_MAX_HEIGHT}
          width={tooltipMaxWidth}
          x={isOnLeft ? x! - tooltipMaxWidth : x}
          y={center!.y - TOOLTIP_MAX_HEIGHT / 2}
        >
          <div
            className={classNames('query-browser__tooltip-wrap', {
              'query-browser__tooltip-wrap--left': isOnLeft,
            })}
          >
            <div className="query-browser__tooltip-arrow" />
            <div className="query-browser__tooltip">
              <div className="query-browser__tooltip-time">{'date'}</div>
              {allSeries.map((s, i) => (
                <div className="query-browser__tooltip-series" key={i}>
                  <div className="query-browser__series-btn" style={{ backgroundColor: 'black' }} />
                  <div className="co-nowrap co-truncate">{s.childName}</div>
                  <div className="query-browser__tooltip-value">{s.y}</div>
                </div>
              ))}
            </div>
          </div>
        </foreignObject>
      </VictoryPortal>
      <line className="query-browser__tooltip-line" x1={x} x2={x} y1="0" y2={height} />
    </>
  );
};

export const graphContainer = (
  // Set activateData to false to work around VictoryVoronoiContainer crash (see
  // https://github.com/FormidableLabs/victory/issues/1314)
  <ChartVoronoiContainer
    activateData={false}
    labelComponent={<Tooltip />}
    labels={() => ' '}
    mouseFollowTooltips={true}
    voronoiDimension="x"
    voronoiPadding={0}
  />
);
