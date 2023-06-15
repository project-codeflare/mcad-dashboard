export enum QueryReturnType {
  PERCENT = 'percent',
  CORES = 'cores',
  BYTES = 'bytes',
}

export type Query = {
  name: string;
  query: string;
  queryReturnType: QueryReturnType;
};

export type MetricData = {
  metric: { namespace: string; pod: string };
  values: [number, string][];
};

export type DataItems = MetricData[];
