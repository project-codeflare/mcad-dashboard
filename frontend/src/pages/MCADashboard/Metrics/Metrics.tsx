import React from 'react';
import RefreshRateDropDown from '../DropDowns/refresh-rate-drop-down';
import { getMetricData, getMetricDataRange } from '~/api/k8s/metricsData';
import MetricsCards from './MetricsCards';
import '../../MCADashboard/MCADashboard.css';
import './Metrics.scss';
import MetricGraph from './MetricGraph';
import TimeRangeDropDown from './time-range-dropdown';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import ApplicationsPage from '../../ApplicationsPage';
import { Query, Unit } from './types';
import { convertRangeToTime } from './metrics-utils';

const statusSummaryQueries: Query[] = [
  {
    name: 'CPU Utilization',
    query: 'cluster:node_cpu:ratio_rate5m{cluster=""} * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'CPU Requests Commitment',
    query:
      '(sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'CPU Limits Commitment',
    query:
      '(sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Memory Utilization',
    query:
      '(1 - sum(:node_memory_MemAvailable_bytes:sum{cluster=""}) / sum(node_memory_MemTotal_bytes{job="node-exporter",cluster=""})) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Memory Requests Commitment',
    query:
      '(sum(namespace_memory:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory",cluster=""})) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Memory Limits Commitment',
    query:
      '(sum(namespace_memory:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory",cluster=""})) * 100',
    unit: Unit.PERCENT,
  },
];

const availableResourceQueries: Query[] = [
  {
    name: 'Available CPU %',
    query: '(1 - cluster:node_cpu:ratio{cluster=""}) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Used CPU %',
    query: 'cluster:node_cpu:ratio{cluster=""} * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Available CPU (Cores)',
    query:
      'sum(cluster:capacity_cpu_cores:sum{cluster=""}) - sum(cluster:cpu_usage_cores:sum{cluster=""})',
  },
  {
    name: 'Available Memory %',
    query: '(1 - cluster:memory_usage:ratio{cluster=""}) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Used Memory %',
    query: 'cluster:memory_usage:ratio{cluster=""} * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Available Memory (Megabytes)',
    query:
      '(sum(cluster:capacity_memory_bytes:sum{cluster=""}) - sum(cluster:memory_usage_bytes:sum{cluster=""})) / 1000000',
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
        <MetricsCards
          queries={statusSummaryQueries}
          name={'Cluster Status Summary'}
          refreshRate={refreshRate}
        />
        <MetricsCards
          queries={availableResourceQueries}
          name={'Cluster Available Resources'}
          refreshRate={refreshRate}
        />
        <MetricGraph
          query={{
            name: 'Appwrapper CPU Usage',
            query:
              'sum by (pod, namespace) (kube_pod_container_resource_requests{job="kube-state-metrics", cluster="", resource="cpu"})',
          }}
          time={span}
          activeTabKey={activeTabKey}
          refreshRate={refreshRate}
        />
        <MetricGraph
          query={{
            name: 'Appwrapper Memory Usage',
            query:
              'sum by (pod, namespace) (kube_pod_container_resource_requests{job="kube-state-metrics", cluster="", resource="memory"} / 1000000)',
          }}
          time={span}
          activeTabKey={activeTabKey}
          refreshRate={refreshRate}
        />
      </ApplicationsPage>
    </>
  );
};

export default Metrics;
