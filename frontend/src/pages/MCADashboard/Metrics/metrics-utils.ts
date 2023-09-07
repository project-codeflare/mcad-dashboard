// import fetchData from '../app-wrapper-data';
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

export const getNamespacesFromAppwrappers = (data: { appwrappers: any }): string[] => {
  const namespaces = new Set<string>();
  const appwrapperData = data.appwrappers;
  for (const key in appwrapperData) {
    namespaces.add(appwrapperData[key].metadata.namespace);
  }
  return Array.from(namespaces);
};

export const convertBytesToBestUnit = (bytes: number): string => {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  //return [size.toFixed(2), units[unitIndex]];
  return `${size.toFixed(2)}${units[unitIndex]}`;
}

export const formatUnitString = (value: number, unit?: Unit): string => {
  const round = (num: number) => {
    return (Math.round(num * 100) / 100).toString();
  };

  if (unit === Unit.APPWRAPPERS || Unit.STATUS) {
    return formatStringOnAxis(value, unit);
  }

  if (unit !== Unit.BYTES && unit !== Unit.PPS) {
    return round(value).toString();
  }
  
  if (unit === Unit.PPS) {
    if (value < 1000) {
      return round(value).toString() + 'pps';
    }
    value /= 1000;
    if (value < 1000) {
      return round(value).toString() + 'kpps';
    }
  }
  if (value < 1000) {
    return round(value).toString() + 'B';
  }
  value /= 1024;
  if (value < 1000) {
    return round(value).toString() + 'KiB';
  }
  value /= 1024;
  if (value < 1000) {
    return round(value).toString() + 'MiB';
  }
  value /= 1024;
  return round(value).toString() + 'GiB';
};

export const formatUnitStringOnAxis = (value: number, maxVal: number, unit?: Unit): string => {
  const round = (num: number) => {
    return (Math.round(num * 100) / 100).toString();
  };
  const maxValString = formatUnitString(maxVal, unit);
  if (maxValString.length <= 1 || (maxValString.charAt(maxValString.length - 1) !== 'B' && maxValString.charAt(maxValString.length - 1) !== 's')) {
    return round(value).toString();
  }
  if (maxValString.charAt(maxValString.length - 1) === 's') {
    const post = maxValString.charAt(maxValString.length - 4);
    switch (post) {
      case 'k':
        return round(value / 1000).toString() + 'kpps';
      default:
        return round(value).toString() + 'pps';
    }
  }
  if (maxValString.length < 3) {
    return round(value).toString();
  }
  const post = maxValString.charAt(maxValString.length - 3);
  switch (post) {
    case 'K':
      return round(value / 1024).toString() + 'KiB';
    case 'M':
      return round(value / 1024 / 1024).toString() + 'MiB';
    case 'G':
      return round(value / 1024 / 1024 / 1024).toString() + 'GiB';
    default:
      return round(value).toString() + 'B';
  }
};

export const formatStringOnAxis = (value: number, unit?: Unit): string => {
  const post = value.toString();
  if (unit === Unit.APPWRAPPERS) {
    switch (post) {
      case '1':
        return '1 Job';
      default:
        return value.toString() + ' Jobs'
    }
  } else if (unit === Unit.STATUS) {
    switch (post) {
      case '0':
        return '';
      case '1':
        return 'Failed';
      case '2':
        return 'Pending';
      case '3':
        return 'Running';
      default:
        return value.toString();
    }
  } else {
    return value.toString();
  }
}

export const filterData = (data: any[], validNamespaces: Set<string> | undefined) => {
  if (data && validNamespaces) {
    const filteredData = data.filter((dataPoint) => {
      return validNamespaces.has(dataPoint.metric.namespace ? dataPoint.metric.namespace : dataPoint.metric.exported_namespace);
    });
    return filteredData;
  } else {
    return undefined;
  }
};
