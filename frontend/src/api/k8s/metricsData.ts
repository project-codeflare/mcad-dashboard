import axios from 'axios';

// const agent = new https.Agent({
//   rejectUnauthorized: false,
// });
// const axiosInstance = axios.create({
//   httpsAgent: agent,
//   headers: {
//     Authorization: 'Bearer sha256~uv0KlPilXp2e_gi5AVj5rbK4B1ZqxviUPsVAa2ahv0c',
//   },
// });

const axiosInstance = axios.create({
  headers: {
    Authorization: 'Bearer sha256~uv0KlPilXp2e_gi5AVj5rbK4B1ZqxviUPsVAa2ahv0c',
  },
});

const fetchPrometheusData = async (host: string, query: string) => {
  const params = new URLSearchParams({
    query: query,
  });

  const url = `${host}?${params.toString()}`;
  console.log(url);
  return axiosInstance
    .post(url)
    .then((res) => {
      console.log(res);
      return res.data.data.result;
    })
    .catch((err) => {
      console.error(`error fetching data from prometheus. Error: ${err}`);
    });
};

const fetchMetric = async (host: string, query: string) => {
  const fetchedData: any = await fetchPrometheusData(host, query);
  console.log('fetchedData', fetchedData);
  const valueAsDecimal = parseFloat(fetchedData[0].value[1]);
  const valueAsPercent = valueAsDecimal * 100;
  return valueAsPercent;
};

const getCpuUtilization = async (host: string) => {
  const query = 'cluster:node_cpu:ratio_rate5m{cluster=""}';
  const cpuUtilization = await fetchMetric(host, query);
  return cpuUtilization;
};

const getCpuRequestsCommitment = async (host: string) => {
  const query =
    'sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})';
  const cpuRequestsCommitment = await fetchMetric(host, query);
  return cpuRequestsCommitment;
};

const getCpuLimitsCommitment = async (host: string) => {
  const query =
    'sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})';

  const cpuLimitsCommitment = await fetchMetric(host, query);
  return cpuLimitsCommitment;
};

const getMetricsData = async () => {
  const host = 'https://localhost:9090/api/v1/query';
  const data: any = {};
  const cpuUtilization = await getCpuUtilization(host);
  const cpuRequestsCommitment = await getCpuRequestsCommitment(host);
  const cpuLimitsCommitment = await getCpuLimitsCommitment(host);
  data.cpuUtilization = cpuUtilization;
  data.cpuRequestsCommitment = cpuRequestsCommitment;
  data.cpuLimitsCommitment = cpuLimitsCommitment;
  console.log('metricsdata', data);
  return data;
};

export default getMetricsData;
