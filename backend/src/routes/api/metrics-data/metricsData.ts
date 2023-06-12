import axios from 'axios';
import { exec } from 'child_process';

const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer sha256~K8Sbr1t1fTC3IKwQ5tSLAaiIBFS419FhPoBRx57GWNk`,
    rejectUnauthorized: false,
  },
});

const fetchPrometheusData = async (host: string, query: string) => {
  const params = new URLSearchParams({
    query: query,
  });

  const url = `https://${host}/api/v1/query?${params.toString()}`;
  return axiosInstance
    .post(url)
    .then((res) => {
      return res.data.data.result;
    })
    .catch((err) => {
      console.error(`error fetching data from prometheus. Error: ${err}`);
    });
};

const fetchPrometheusDataRange = async (
  host: string,
  query: string,
  start: number,
  end: number,
  step: number,
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
      console.error(`error fetching data from Prometheus. Error: ${err}`);
    });
};

const getMetric = async (host: string, query: string) => {
  const fetchedData: any = await fetchPrometheusData(host, query);
  const valueAsDecimal = parseFloat(fetchedData[0].value[1]);
  const valueAsPercent = valueAsDecimal * 100;
  return valueAsPercent;
};

const getMetricRange = async (host: string, query: string, range: number[]) => {
  const fetchedData: any = await fetchPrometheusDataRange(host, query, range[0], range[1], 6);
  return fetchedData;
};

const getHost = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('./src/routes/api/metrics-data/get-route.sh', (err, stdout, stderr) => {
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

export { getMetric, getMetricRange, getHost };
