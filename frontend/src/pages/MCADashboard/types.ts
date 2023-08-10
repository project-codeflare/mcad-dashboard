export interface Data {
  appwrappers: {
    [key: string]: {
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
    };
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

export type StatusKey = keyof Data['stats']['statusCounts'];