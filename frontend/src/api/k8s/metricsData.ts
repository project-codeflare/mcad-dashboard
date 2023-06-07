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
  switch (range) {
    case '5m':
      rangeArr.push(dtNow - 5 * 60);
  }
  rangeArr.push(dtNow);
  body.range = rangeArr;
  const res = await axios.post('/api/metrics-data', body);
  return res;
};

export { getMetricData, getMetricDataRange };
