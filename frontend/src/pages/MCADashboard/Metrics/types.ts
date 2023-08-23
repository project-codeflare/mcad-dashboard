export type Query = {
  name: string;
  query: string;
  unit?: Unit;
};

export type MetricData = {
  metric: {
    exported_pod: string;
    appwrapper_name: string;
    status: any; 
    namespace: string; 
    pod: string
  };
  values: [number, string][];
};

export type DataItems = MetricData[];

export enum Unit {
  PERCENT = '%',
  BYTES = 'M',
}
