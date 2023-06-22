export type Query = {
  name: string;
  query: string;
  unit?: Unit;
};

export type MetricData = {
  metric: { namespace: string; pod: string };
  values: [number, string][];
};

export type DataItems = MetricData[];

export enum Unit {
  PERCENT = '%',
  MEGABYTE = 'M',
}
