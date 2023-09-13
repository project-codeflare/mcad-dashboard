// import fetchData from '../app-wrapper-data';
import { Unit, MetricData } from './types';

export const convertRangeToTime = (timeRange: string) => {
  const unitChar = timeRange.charAt(0);
  if (unitChar !== 'L') {
    const parts = timeRange.split(' ');
    switch (parts[1]) {
      case 'minutes':
        return parts[0] + 'm';
      case 'hours':
        return parts[0] + 'h';
      case 'days':
        return parts[0] + 'd';
      case 'weeks':
        return parts[0] + 'w';
      case 'months':
        return parts[0] + 'mo';
      case 'years':
        return parts[0] + 'y';
      default:
        throw new Error('invalid input');
    }
  } else {
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
  }
};

export const timeStringToSeconds = (timeString: string) => {
  const value: number = parseInt(timeString.substring(0, timeString.length - 1));
  const unit = timeString.charAt(timeString.length - 1).toLowerCase();
  const secsInMin = 60;
  const minInHour = 60;
  const hoursInDay = 30;
  const daysInWeeks = 7;
  const daysInMonth = 30;
  const daysInYear = 365;
  switch (unit) {
    case 'm':
      return value * secsInMin;
    case 'h':
      return value * minInHour * secsInMin;
    case 'd':
      return value * hoursInDay * minInHour * secsInMin;
    case 'w':
      return value * daysInWeeks * hoursInDay * minInHour * secsInMin;
    case 'o': // month - mo (last char - o)
      return value * daysInMonth * hoursInDay * minInHour * secsInMin;
    case 'y':
      return value * daysInYear * hoursInDay * minInHour * secsInMin;
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

  if (unit === Unit.APPWRAPPERS || unit === Unit.STATUS) { // case of appwrappers or appwrapper status
    return formatStringOnAxis(value, unit);
  } else if (unit === Unit.PPS) { // case of network
    if (value < 1000) {
      return round(value).toString() + 'pps';
    }
    value /= 1000;
    if (value < 1000) {
      return round(value).toString() + 'kpps';
    }
  } else if (unit === Unit.BYTES) { // case of network
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
  }
  return round(value).toString()

  // if (unit !== Unit.BYTES && unit !== Unit.PPS) { // case for no unit assigned
  //   return round(value).toString();
  // }

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
        if (post.includes('.')) {
          return '';
        } else {
          return post + ' Jobs';
        }
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
        return "";
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

export const filterDataByAppwrappers = (data: any[], validAppwrappers: Set<string> | undefined) => {
  if (data && validAppwrappers) {
    const filteredData = data.filter((dataPoint) => {
      return Array.from(validAppwrappers).some((appwrapper) => {
        if (dataPoint.metric.pod !== undefined) {
          return dataPoint.metric.pod.includes(appwrapper);
        } else {
          return dataPoint.metric.exported_pod.includes(appwrapper);
        }
      });
    });
    return filteredData;
  } else {
    return undefined;
  }
};

export const formatTickValues = (data: MetricData[]): Number[] => {
  let tickValues: Number[] = [];
  console.log("data", data)
  return tickValues;
}