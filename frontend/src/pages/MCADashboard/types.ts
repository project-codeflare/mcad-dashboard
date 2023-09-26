export interface Appwrapper {
  metadata: {
    namespace: string;
    name: string;
    calculatedTimeSpent: string;
    creationTimestamp: string;
  };
  status: {
    state: string;
    constructedMessage: string;
    numRequeuings: number;
    systempriority: number;
    rephrased_state: string;
  };
}

export interface Data {
  appwrappers: {
    [key: string]: Appwrapper;
  };
  stats: {
    statusCounts: {
      Dispatched: number | string;
      Queued: number | string;
      'Re-enqueued': number | string;
      Failed: number | string;
      Other: number | string;
    };
  };
}

export interface AppwrapperList {
  apiVersion: string;
  kind: string;
  items: any[];
}

export type StatusKey = keyof Data['stats']['statusCounts'];