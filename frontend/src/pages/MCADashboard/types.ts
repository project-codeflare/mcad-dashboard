
export interface Data {
    appwrappers: {
        [key: string]: {
            metadata: {
                namespace: string;
                name: string;
                calculatedTimeSpent: string;
                creationTimestamp:string;
            };
            status: {
                state: string;
                constructed_message: string;
                numRequeuings: number;
                systempriority: number;
                rephrased_state: string;
            };
        };
    };
    stats: {
        status_counts: {
            Dispatched: number | string;
            Queued: number | string;
            "Re-enqueued": number | string;
            Other: number | string;
        };
    };
}