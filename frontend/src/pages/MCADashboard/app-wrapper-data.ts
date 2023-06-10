const fetchData = async () => {
  try {
    const response = await fetch('/api/appwrappers');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    const jsonBody = JSON.parse(jsonData.body);
    return jsonBody;
  } catch (error) {
    console.log('Error:', error);
  }
};

export default fetchData;
