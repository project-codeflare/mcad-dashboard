import { VictoryPortal } from 'victory-core';
import React from 'react';
import classNames from 'classnames';
import { ChartVoronoiContainer } from '@patternfly/react-charts';
import { formatUnitString } from './metrics-utils';
import { Unit } from './types';

const TOOLTIP_MAX_ENTRIES = 1000;
const TOOLTIP_MAX_WIDTH = 400;
const TOOLTIP_MAX_HEIGHT = 400;
const TOOLTIP_MAX_LEFT_JUT_OUT = 85;
const TOOLTIP_MAX_RIGHT_JUT_OUT = 45;

// type TooltipSeries = {
//   color: string;
//   name: string;
//   total: number;
//   value: string;
// };

type TooltipProps = {
  activePoints?: { x: number; y: number; childName: string }[];
  center?: { x: number; y: number };
  height?: number;
  style?: { unit: Unit; name: string }[];
  width?: number;
  x?: number;
};

const Tooltip: React.FC<TooltipProps> = ({
  activePoints,
  center,
  height,
  style,
  width,
  x,
}: TooltipProps) => {
  const timeInSeconds = activePoints?.[0]?.x;

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

  // const sortedActivePoints = activePoints!.sort((a, b) => b.y - a.y);
  const allSeries = activePoints!.slice(0, TOOLTIP_MAX_ENTRIES);

  const dateTime = (timeInSeconds: number | undefined) => {
    if (!timeInSeconds) {
      return '';
    }

    const timestamp = timeInSeconds * 1000;
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

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
              <div className="query-browser__tooltip-time">{dateTime(timeInSeconds)}</div>
              {allSeries.map((s, i) => (
                <div className="query-browser__tooltip-series" key={i}>
                  <div className="query-browser__series-btn" style={{ backgroundColor: 'black' }} />
                  <div className="co-nowrap co-truncate">{s.childName}</div>
                  <div className="query-browser__tooltip-value">
                    {style ? formatUnitString(s.y, style[0].unit) : formatUnitString(s.y)}
                  </div>
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
