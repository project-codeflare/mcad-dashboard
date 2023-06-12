import axios from 'axios';
import { PrometheusQueryResponse } from '~/types';
import usePrometheusQuery from '../prometheus/usePrometheusQuery';
import React from 'react';

const getMetricData = async (query: string) => {
  const body = { query: query };
  const res = await axios.post('/api/metrics-data', body);
  return res;
};
const getMetricDataRange = async (query: string, range: string) => {
  const body: any = { query: query };
  const dtNow = new Date().getTime() / 1000; // prometheus must use seconds
  const rangeArr: number[] = [];
  const timeBeforeSeconds: number = timeStringToSeconds(range); // getting the # seconds before dtNow
  const step = timeBeforeSeconds / 60;
  body.step = step;
  rangeArr.push(dtNow - timeBeforeSeconds);
  rangeArr.push(dtNow);
  body.range = rangeArr;
  const res = await axios.post('/api/metrics-data', body);
  return res;
};

const timeStringToSeconds = (timeString: string) => {
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
    case 'M':
      return value * 7 * 24 * 60 * 60 * 4;
    default:
      throw new Error('Invalid time unit');
  }
};

export { getMetricData, getMetricDataRange };
