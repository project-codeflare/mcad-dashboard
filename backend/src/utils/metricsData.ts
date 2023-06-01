import axios from 'axios';

async function getData(hostUrl: any) {
  const fullQuery = hostUrl;
  //   const data = await axios.get(fullQuery);
  const axiosInstance = axios.create({});
  const data = await axiosInstance.get(fullQuery);
  console.log(data);
  return data;
}

getData(
  'https://thanos-querier-openshift-monitoring.mcad-dev-us-south-1-bx2-4-d9216b613387d80bef1a9d1d5bfb1331-0000.us-south.containers.appdomain.cloud/api/prometheus/query?query=http_requests_total',
);
