import { AppwrapperList } from './types';

export const fetchData = async () => {
  try {
    const response = await fetch('/api/appwrappers');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    const jsonBody = JSON.parse(jsonData.body);
    //console.log('fetchData call: ', jsonBody);
    return jsonBody;
  } catch (error) {
    console.log('Error:', error);
  }
};

const callK8sApi = async () => {
  try {
    const response = await fetch('/api/k8s/apis/mcad.ibm.com/v1beta1/namespaces/brain/appwrappers?limit=500');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    //console.log('successful k8s call: ', jsonData);
    return jsonData;
    
  } catch (error) {
    console.log('Error: ', error);
    return ""
  }
}

export const getAppwrappers = async() => {
  const dtNow = new Date(Date.now());

  const appwrappersJson: AppwrapperList = await callK8sApi();
  const statusCounts = { Dispatched: 0, Queued: 0, 'Re-enqueued': 0, Failed: 0, Other: 0 };
  const stats: { statusCounts: {
    Dispatched: number | string;
    Queued: number | string;
    'Re-enqueued': number | string;
    Failed: number | string;
    Other: number | string;
  } } = { statusCounts: statusCounts };
  const wrappers: { [key: string]: any } = {};
  const wrappersLite: { [key: string]: any } = {};

  const appwrappersList = appwrappersJson.items
  for (let i = 0; i < appwrappersList.length; i++) {
    let jsonData = appwrappersList[i];

    //Verify and set system priority
    if (!jsonData.status.systempriority) {
      if (!jsonData.spec.priority) {
        jsonData.status.systempriority = 'Not found';
      } else {
        jsonData.status.systempriority = jsonData.spec.priority;
      }
    }

    //Identify message in last status condition, if state is other than 'Running'
    const conditionsArr: any[] = jsonData.status.conditions;
    const lastCondition = conditionsArr[conditionsArr.length - 1];
    let message = '';

    message = message + lastCondition.type;
    message = message + '. Reason: ' + lastCondition.reason;
    if (lastCondition.message) {
      message = message + '\nMessage: ' + lastCondition.message;
    }

    jsonData.status.constructedMessage = message;

    // create formatted age
    let timestr = '';
    if (jsonData.metadata.creationTimestamp) {
      const dtCreation = new Date(jsonData.metadata.creationTimestamp);
      const delta = dtNow.getTime() - dtCreation.getTime();
      let deltasec = delta / 1000;
      const day = Math.trunc(deltasec / (24 * 3600));
      deltasec = deltasec % (24 * 3600);
      const hour = Math.trunc(deltasec / 3600);
      deltasec %= 3600;
      const minutes = Math.trunc(deltasec / 60);
      deltasec %= 60;
      const seconds = deltasec;
      timestr =
        day.toString() +
        'd ' +
        hour.toString() +
        'h ' +
        minutes.toString() +
        'm ' +
        Math.floor(seconds).toString() +
        's';
    } else {
      timestr = 'Not found';
    }
    jsonData.metadata.calculatedTimeSpent = timestr;

    // Identify status and add to counts
    let numRequeuings = 0;
    const state: string = jsonData.status.state.trim();
    let rephrasedState = '';
    if (state === '') {
      rephrasedState = 'Submitted';
      statusCounts.Other = statusCounts.Other + 1;
    } else if (state === 'Running') {
      rephrasedState = 'Dispatched';
      statusCounts.Dispatched = statusCounts.Dispatched + 1;
    } else if (state === 'Pending') {
      try {
        numRequeuings = jsonData.spec.schedulingSpec.requeuing.numRequeuings;
        if (Number(numRequeuings) > 0) {
          rephrasedState = 'Re-enqueued';
          statusCounts['Re-enqueued'] = statusCounts['Re-enqueued'] + 1;
        } else {
          rephrasedState = 'Queued';
          statusCounts.Queued = statusCounts.Queued + 1;
        }
      } catch (e) {
        rephrasedState = 'Queued';
        statusCounts.Queued = statusCounts.Queued + 1;
      }
    } else if (state === 'Failed') {
      rephrasedState = 'Failed';
      statusCounts.Failed = statusCounts.Failed + 1;
    } else if (state === 'RunningHoldCompletion') {
      rephrasedState = 'CompletedWithRunningPods';
      statusCounts.Other = statusCounts.Other + 1;
    } else {
      rephrasedState = jsonData.status.state;
      statusCounts.Other = statusCounts.Other + 1;
    }
    jsonData.status.rephrasedState = rephrasedState;

    const wrapperKey: string =
      jsonData.metadata.name.toString() + jsonData.metadata.namespace.toString();
    wrappers[wrapperKey] = jsonData;

    const metaData = {
      creationTimestamp: jsonData.metadata.creationTimestamp,
      calculatedTimeSpent: jsonData.metadata.calculatedTimeSpent,
      name: jsonData.metadata.name,
      namespace: jsonData.metadata.namespace,
    };
    const status = {
      state: jsonData.status.state,
      systempriority: jsonData.status.systempriority,
      rephrasedState: jsonData.status.rephrasedState,
      numRequeuings: Number(numRequeuings),
      constructedMessage: jsonData.status.constructedMessage,
    };
    wrappersLite[wrapperKey] = { metadata: metaData, status: status };

  }
  stats['statusCounts'] = statusCounts;
  const finalJson = { stats: stats, appwrappers: wrappersLite };
  return finalJson;
}

