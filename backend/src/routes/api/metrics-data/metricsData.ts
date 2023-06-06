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

  const url = `${host}?${params.toString()}`;
  return axiosInstance
    .post(url)
    .then((res) => {
      return res.data.data.result;
    })
    .catch((err) => {
      console.error(`error fetching data from prometheus. Error: ${err}`);
    });
};

const fetchMetric = async (host: string, query: string) => {
  const fetchedData: any = await fetchPrometheusData(host, query);
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
  const host =
    'https://thanos-querier-openshift-monitoring.mcad-dev-us-south-1-bx2-4-d9216b613387d80bef1a9d1d5bfb1331-0000.us-south.containers.appdomain.cloud/api/v1/query';
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

getMetricsData();

export default getMetricsData;
