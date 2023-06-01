import axios from 'axios';

async function getData(hostUrl) {
  const query1 = 'http_requests_total';
  const fullQuery = hostUrl + query1;
  const axiosInstance = axios.create({
    baseURL: fullQuery,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
  const data = await axiosInstance.get('/');
  return data;
}

module.exports = getData;
