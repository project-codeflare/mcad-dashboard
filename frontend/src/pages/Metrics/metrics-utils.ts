import { QueryReturnType } from './types';

export const formatData = (data: number, queryReturnType: QueryReturnType) => {
  switch (queryReturnType) {
    case QueryReturnType.PERCENT:
      return data * 100;
    case QueryReturnType.BYTES:
      return data / 1000000;
    default:
      return data;
  }
};

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
