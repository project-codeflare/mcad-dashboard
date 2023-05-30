const fetchData = async () => {
  try {
    const response = await fetch('http://mcad-dashboard-json-puller-route-default.mcad-dev-us-south-1-bx2-4-d9216b613387d80bef1a9d1d5bfb1331-0000.us-south.containers.appdomain.cloud/all_namespaces');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.log('Error:', error);
  }
};

export default fetchData;