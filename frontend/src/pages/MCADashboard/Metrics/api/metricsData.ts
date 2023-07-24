import axios from 'axios';
import { PrometheusQueryResponse } from '~/types';
import React from 'react';
import { timeStringToSeconds } from '~/pages/MCADashboard/Metrics/metrics-utils';

export const getMetricData = async (query: string) => {
  const body = { query: query };
  const res: { data: { value: [string, number] }[] } = await axios.post('/api/metrics-data', body);
  return res.data[0].value[1];
};

export const getMetricTableData = async (query: string) => {
  const body = { query: query };
  const res = await axios.post('/api/metrics-data', body);
  return res.data;
};

export const getMetricDataRange = async (query: string, range: string) => {
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


/* mcad */
export const getMCADMetricData = async (query: string) => {
  const body = { query: query };
  const res: { data: { value: [string, number] }[] } = await axios.post('/api/mcad-prometheus', body);
  return res.data[0].value[1];
};

export const getMCADMetricTableData = async (query: string) => {
  const body = { query: query };
  const res = await axios.post('/api/mcad-prometheus', body);
  return res.data;
};

export const getMCADMetricDataRange = async (query: string, range: string) => {
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
  const res = await axios.post('/api/mcad-prometheus', body);
  return res;
};
