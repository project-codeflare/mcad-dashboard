import React from 'react';
import RefreshRateDropDown from '../MCADashboard/DropDowns/refresh-rate-drop-down';
import { getMetricData, getMetricDataRange } from '~/api/k8s/metricsData';
import MetricsCards from './MetricsCards';
import '../MCADashboard/MCADashboard.css';
import './Metrics.scss';
import MetricGraph from './MetricGraph';
import TimeRangeDropDown from './time-range-dropdown';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import ApplicationsPage from '../ApplicationsPage';

export enum QueryReturnType {
  PERCENT = 'percent',
  CORES = 'cores',
  BYTES = 'bytes',
}

type query = {
  name: string;
  query: string;
  queryReturnType: QueryReturnType;
};

const statusSummaryQueries: query[] = [
  {
    name: 'CPU Utilization',
    query: 'cluster:node_cpu:ratio_rate5m{cluster=""}',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'CPU Requests Commitment',
    query:
      'sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'CPU Limits Commitment',
    query:
      'sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'Memory Utilization',
    query:
      '1 - sum(:node_memory_MemAvailable_bytes:sum{cluster=""}) / sum(node_memory_MemTotal_bytes{job="node-exporter",cluster=""})',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'Memory Requests Commitment',
    query:
      'sum(namespace_memory:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory",cluster=""})',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'Memory Limits Commitment',
    query:
      'sum(namespace_memory:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory",cluster=""})',
    queryReturnType: QueryReturnType.PERCENT,
  },
];

const availableResourceQueries: query[] = [
  {
    name: 'Available CPU %',
    query: '1 - cluster:node_cpu:ratio{cluster=""}',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'Available CPU (Cores)',
    query:
      'sum(cluster:capacity_cpu_cores:sum{cluster=""}) - sum(cluster:cpu_usage_cores:sum{cluster=""})',
    queryReturnType: QueryReturnType.CORES,
  },
  {
    name: 'Available Memory %',
    query: '1 - cluster:memory_usage:ratio{cluster=""}',
    queryReturnType: QueryReturnType.PERCENT,
  },
  {
    name: 'Available Memory (Megabytes)',
    query:
      'sum(cluster:capacity_memory_bytes:sum{cluster=""}) - sum(cluster:memory_usage_bytes:sum{cluster=""})',
    queryReturnType: QueryReturnType.BYTES,
  },
];

type MetricsProps = {
  activeTabKey: number;
};

const Metrics: React.FC<MetricsProps> = ({ activeTabKey }: MetricsProps): React.ReactElement => {
  const [refreshRate, setRefreshRate] = React.useState<number>(30000);
  const [span, setSpan] = React.useState<string>('2w');
  const handleRefreshSelection = (selectedItemId: number) => {
    setRefreshRate(selectedItemId);
  };

  const handleTimeRangeSelection = (item: string) => {
    setSpan(item);
  };

  const { components, loaded, loadError } = useWatchComponents(true);
  const isEmpty = !components || components.length === 0;

  const convertRangeToTime = (timeRange: string) => {
    switch (timeRange) {
      case 'Custom Time Range':
        return '5m';
      case 'Last 5 minutes':
        return '5m';
      case 'Last 10 minutes':
        return '10m';
      case 'Last 30 minutes':
        return '30m';
      case 'Last 1 hour':
        return '1h';
      case 'Last 2 hours':
        return '2h';
      case 'Last 1 day':
        return '1d';
      case 'Last 2 days':
        return '2d';
      case 'Last 1 week':
        return '1w';
      case 'Last 2 weeks':
        return '2w';
      default:
        throw new Error('invalid input');
    }
  };

  return (
    <>
      <ApplicationsPage
        title={undefined}
        description={undefined}
        loaded={loaded}
        empty={isEmpty}
        loadError={loadError}
      >
        <div className="dropdowns-container">
          <RefreshRateDropDown onSelected={handleRefreshSelection} />
          <div className="spacer" />
          <TimeRangeDropDown
            onSelected={handleTimeRangeSelection}
            dateFormatter={convertRangeToTime}
          />
        </div>
        <MetricsCards queries={statusSummaryQueries} name={'Status Summary'} />
        <MetricsCards queries={availableResourceQueries} name={'Available Resources'} />
        <MetricGraph
          name={'CPU Usage'}
          query={
            'sum by (namespace, pod) (node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""})'
          }
          time={span}
          activeTabKey={activeTabKey}
        />
      </ApplicationsPage>
    </>
  );
};

export default Metrics;
