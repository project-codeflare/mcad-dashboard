import axios, { AxiosInstance } from 'axios';
import { exec } from 'child_process';
import { OauthFastifyRequest, KubeFastifyInstance } from '../../../types';
import { getDirectCallOptions } from '../../../utils/directCallUtils';

const fetchPrometheusData = async (host: string, query: string, axiosInstance: AxiosInstance) => {
  const params = new URLSearchParams({
    query: query,
  });

  const url = `https://${host}/api/v1/query?${params.toString()}`;
  console.log('FETCHING RPOMETJFDKS URL: ', url);
  return axios //Instance
    .post(url)
    .then((res) => {
      return res.data.data.result;
    })
    .catch((err) => {
      return Error(`error fetching data from prometheus. Error: ${err}`);
    });
};

const fetchPrometheusDataRange = async (
  host: string,
  query: string,
  start: number,
  end: number,
  step: number,
  axiosInstance: AxiosInstance,
) => {
  const params = new URLSearchParams({
    start: start.toString(),
    end: end.toString(),
    step: step.toString(),
    query: query,
  });
  const url = `https://${host}/api/v1/query_range?${params.toString()}`;
  return axiosInstance
    .get(url)
    .then((res) => {
      return res.data.data.result;
    })
    .catch((err) => {
      return Error(`error fetching data from Prometheus. Error: ${err}`);
    });
};

const getMetric = async (host: string, query: string, axiosInstance: AxiosInstance) => {
  const fetchedData: any = await fetchPrometheusData(host, query, axiosInstance);
  //const valueAsDecimal = parseFloat(fetchedData[0].value[1]);
  return fetchedData;
};

const getMetricRange = async (
  host: string,
  query: string,
  range: number[],
  axiosInstance: AxiosInstance,
  step: number,
) => {
  const fetchedData: any = await fetchPrometheusDataRange(
    host,
    query,
    range[0],
    range[1],
    step,
    axiosInstance,
  );
  console.log('fetched range data...: ', fetchedData);
  return fetchedData;
};

const getHost = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('./src/routes/api/mcad-prometheus/get-route.sh', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const metricsData = async (
  fastify: KubeFastifyInstance,
  request: OauthFastifyRequest,
  query: string,
  range?: number[],
  step?: number,
) => {
  const host = await getHost();
  if (!host) {
    return new Error('host not found');
  }
  const res = await getDirectCallOptions(fastify, request, host);
  const auth = res.headers.Authorization.toString();
  if (!auth || auth.substring(0, 6) !== 'Bearer') {
    return new Error('auth not found');
  }
  const axiosInstance = axios.create({
    headers: {
      //Authorization: auth,
      //rejectUnauthorized: false,
    },
  });
  if (!range) {
    const data = await getMetric(host, query, axiosInstance);
    return data;
  } else {
    const data = await getMetricRange(host, query, range, axiosInstance, step);
    return data;
  }
};

export { metricsData };
