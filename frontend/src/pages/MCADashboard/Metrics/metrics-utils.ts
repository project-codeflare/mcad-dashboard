import fetchData from '../app-wrapper-data';
import { Unit } from './types';

export const convertRangeToTime = (timeRange: string) => {
  switch (timeRange) {
    case 'Custom Time Range':
      return '5m';
    case 'Last 5 minutes':
      return '5m';
    case 'Last 10 minutes':
      return '10m';
    case 'Last 30 minutes':
      return '30m';
    case 'Last 1 hour':
      return '1h';
    case 'Last 2 hours':
      return '2h';
    case 'Last 1 day':
      return '1d';
    case 'Last 2 days':
      return '2d';
    case 'Last 1 week':
      return '1w';
    case 'Last 2 weeks':
      return '2w';
    default:
      throw new Error('invalid input');
  }
};

export const timeStringToSeconds = (timeString: string) => {
  const value: number = parseInt(timeString.substring(0, timeString.length - 1));
  const unit = timeString.charAt(timeString.length - 1).toLowerCase();
  switch (unit) {
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    case 'w':
      return value * 7 * 24 * 60 * 60;
    default:
      throw new Error('Invalid time unit');
  }
};

export const getNamespacesFromAppwrappers = (data): string[] => {
  const namespaces = new Set<string>();
  const appwrapperData = data.appwrappers;
  for (const key in appwrapperData) {
    namespaces.add(appwrapperData[key].metadata.namespace);
  }
  return Array.from(namespaces);
};

export const formatUnitString = (value: number, unit?: Unit) => {
  const round = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  if (unit != Unit.MEGABYTE) {
    return round(value).toString();
  }
  if (value >= 1000) {
    value = value / 1000;
    return round(value).toString() + 'G';
  }
  return round(value).toString() + 'M';
};

export const filterData = (data, validNamespaces) => {
  if (data && validNamespaces) {
    const filteredData = data.filter((dataPoint) => {
      return validNamespaces.has(dataPoint.metric.namespace);
    });
    return filteredData;
  } else {
    return undefined;
  }
};
