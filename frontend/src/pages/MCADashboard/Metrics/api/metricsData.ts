import axios from 'axios';
import { PrometheusQueryResponse } from '~/types';
import usePrometheusQuery from '../../../../api/prometheus/usePrometheusQuery';
import React from 'react';
import { timeStringToSeconds } from '~/pages/MCADashboard/Metrics/metrics-utils';

const getMetricData = async (query: string) => {
  const body = { query: query };
  const res = await axios.post('/api/metrics-data', body);
  return res;
};
const getMetricDataRange = async (query: string, range: string) => {
  const body: any = { query: query };
  const dtNow = new Date().getTime() / 1000; // prometheus uses seconds
  const rangeArr: number[] = [];
  const timeBeforeSeconds: number = timeStringToSeconds(range); // getting the # seconds before dtNow
  let step: number;
  if (range === '5m' || range === '15m') {
    step = 5;
  } else {
    step = timeBeforeSeconds / 300;
  }
  body.step = step;
  rangeArr.push(dtNow - timeBeforeSeconds);
  rangeArr.push(dtNow);
  body.range = rangeArr;
  const res = await axios.post('/api/metrics-data', body);
  return res;
};

export { getMetricData, getMetricDataRange };
