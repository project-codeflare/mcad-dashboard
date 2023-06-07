import axios from 'axios';

const axiosInstance = axios.create({
  headers: {
    Authorization: 'Bearer sha256~BM2thN4XpaYR07JaIq0Fv8J5LXAMOKeOVpieNTdYzY0',
  },
});

const host =
  'https://thanos-querier-openshift-monitoring.mcad-dev-us-south-1-bx2-4-d9216b613387d80bef1a9d1d5bfb1331-0000.us-south.containers.appdomain.cloud/api/v1/';

const fetchPrometheusData = async (host: string, query: string) => {
  const params = new URLSearchParams({
    query: query,
  });

  const url = `${host}query?${params.toString()}`;
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
  const url = `${host}query_range?${params.toString()}`;
  return axiosInstance
    .get(url)
    .then((res) => {
      return res.data.data.result;
    })
    .catch((err) => {
      console.error(`error fetching data from Prometheus. Error: ${err}`);
    });
};

const getMetric = async (query: string) => {
  const fetchedData: any = await fetchPrometheusData(host, query);
  const valueAsDecimal = parseFloat(fetchedData[0].value[1]);
  const valueAsPercent = valueAsDecimal * 100;
  return valueAsPercent;
};

const getMetricRange = async (query: string, range: number[]) => {
  const fetchedData: any = await fetchPrometheusDataRange(host, query, range[0], range[1], 6);
  return fetchedData;
};

export { getMetric, getMetricRange };
