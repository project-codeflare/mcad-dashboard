import axios from 'axios';
import { PrometheusQueryResponse } from '~/types';
import React from 'react';
import { timeStringToSeconds } from '~/pages/MCADashboard/Metrics/metrics-utils';

export const getMetricData = async (query: string) => {
  const noGpu = "No GPU In Cluster"
  const utilizedGPUQuery = 'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"})) or vector(0)'
  const utilizedGPUMemoryQuery = 'count(count by (UUID,GPU_I_ID) (DCGM_FI_DEV_MEM_COPY_UTIL))'
  try {
    const body = { query: query };
    const res: { data: { value: [string, number] }[] } = await axios.post('/api/metrics-data', body);
    if (query === utilizedGPUQuery) { // since vector(0) in query, even if no gpu in cluster returns 0
      const gpubody = { query: utilizedGPUMemoryQuery }; // use the utilizedGPUMemoryQuery to verify gpu is present in the cluster
      const gpures: { data: { value: [string, number] }[] } = await axios.post('/api/metrics-data', gpubody);
      if (gpures.data && gpures.data[0] && gpures.data[0].value && gpures.data[0].value[1] !== undefined) {
        return res.data[0].value[1];
      } else {
        return noGpu;
      }
    } else {
      if (res.data && res.data[0] && res.data[0].value && res.data[0].value[1] !== undefined) {
        return res.data[0].value[1];
      } else {
        if (query === utilizedGPUMemoryQuery) {
          return noGpu;
        } else {
          return 0;
        }
      }
    }
  } catch (error) {
    return 0;
  }
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
