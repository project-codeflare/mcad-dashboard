import axios from 'axios';

const axiosInstance = axios.create({
  headers: {
    Authorization: 'Bearer sha256~Hc3Dt8ZWDoAyMV7mWJjIJB815lnzzioKezLVbfBglTY',
  },
});

const fetchPrometheusData = async (host: string, query: string) => {
  const params = new URLSearchParams({
    query: query,
  });

  const url = `${host}/query?${params.toString()}`;
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
    query: query,
    start: start.toString(),
    end: end.toString(),
    step: step.toString(),
  });
  const url = `${host}?${params.toString()}`;
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
  console.log(fetchedData);
};

export { getMetric, getMetricRange };
