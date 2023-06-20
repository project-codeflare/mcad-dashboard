import fetchData from '../app-wrapper-data';

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
  console.log('timeString', timeString);
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

export const getAllAppwrapperNamespaces = async () => {
  let appwrapperData;
  const namespaces = new Set<string>();
  const dataFromStorage = sessionStorage.getItem('appwrapper-data');
  try {
    const parsedData = JSON.parse(dataFromStorage ? dataFromStorage : '');
    if (parsedData.appwrappers && parsedData.stats) {
      appwrapperData = parsedData;
    } else {
      appwrapperData = await fetchData();
    }
  } catch (err) {
    appwrapperData = await fetchData();
  }
  appwrapperData = appwrapperData.appwrappers;
  for (const key in appwrapperData) {
    namespaces.add(appwrapperData[key].metadata.namespace);
  }
  return namespaces;
};
