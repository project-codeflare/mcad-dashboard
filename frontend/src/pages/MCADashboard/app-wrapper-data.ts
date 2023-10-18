import { AppwrapperList } from './types';

const callK8sApi = async (isAdmin: boolean) => {
  try {
    // isAdmin - get all appwrappers from all namespaces
    if (isAdmin) {
      const response = await fetch('/api/k8s/apis/workload.codeflare.dev/v1beta1/appwrappers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      return { apiVersion: 'workload.codeflare.dev/v1beta1', kind: 'AppWrapperList', items: jsonData.items };
    }
    // Get available namespaces
    const projectResp = await fetch('/api/k8s/apis/project.openshift.io/v1/projects');
    if (!projectResp.ok) {
      throw new Error(`HTTP error! status: ${projectResp.status}`);
    }
    const projectsData = await projectResp.json();
    const projectsList = projectsData.items;
    let appwrappersList: any[] = []; //TODO there's probably some type that already does this...

    // get appwrappers in each namespace
    for (let i = 0; i < projectsList.length; i++) {
      let projectName = projectsList[i].metadata.name;
      let apiCall = '/api/k8s/apis/workload.codeflare.dev/v1beta1/namespaces/'.concat(projectName, '/appwrappers');
      let response = await fetch(apiCall);
      if (!response.ok) {
          console.log(`Set proper permissions for namespace: ${projectName} - rolebinding [view] and for resource Appwrapper - rolebinding [appwrappers-list]`)
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      let appwrapperData = await response.json();
      // add to running list of appwrappers
      appwrappersList = appwrappersList.concat(appwrapperData.items);
    }
    const finalJson = { apiVersion: 'workload.codeflare.dev/v1beta1', kind: 'AppWrapperList', items: appwrappersList };
    return finalJson;
  } catch (error) {
    console.log('Error: ', error);
    return { apiVersion: 'workload.codeflare.dev/v1beta1', kind: 'AppWrapperList', items: [] };
  }
}

export const getAppwrappers = async( isAdmin: boolean ) => {
  const dtNow = new Date(Date.now());

  const appwrappersJson: AppwrapperList = await callK8sApi( isAdmin );
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

