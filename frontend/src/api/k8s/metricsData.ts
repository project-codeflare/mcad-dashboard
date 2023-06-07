import axios from 'axios';
import { PrometheusQueryResponse } from '~/types';
import usePrometheusQuery from '../prometheus/usePrometheusQuery';
import React from 'react';

const getMetricData = async (host: string, query: string) => {
  const body = { host: host, query: query };
  const res = await axios.post('/api/metrics-data', body);
  return res;
};
const getMetricDataRange = async (host: string, query: string, range: string) => {
  const body: any = { host: host, query: query };
  const dtNow = new Date().getTime();
  const rangeArr: number[] = [];
  switch (range) {
    case '5m':
      rangeArr.push(dtNow - 5 * 60 * 1000);
  }
  rangeArr.push(dtNow);
  body.range = rangeArr;
  const res = await axios.post('/api/metrics-data', body);
  return res;
};

export { getMetricData, getMetricDataRange };
