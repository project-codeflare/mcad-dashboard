import { Query, Unit } from './types';

export const availableResourceQueries: Query[] = [
  {
    name: 'Available CPU %',
    query: '(1 - cluster:node_cpu:ratio{cluster=""}) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Utilized CPU %',
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
    name: 'Utilized Memory %',
    query: 'cluster:memory_usage:ratio{cluster=""} * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Available Memory (Mebibytes)',
    query:
      '(sum(cluster:capacity_memory_bytes:sum{cluster=""}) - sum(cluster:memory_usage_bytes:sum{cluster=""})) / 1048576',
  },
];

export const statusSummaryQueries: Query[] = [
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

export const graphQueries: Query[] = [
  {
    name: 'CPU Usage (by Appwrapper)',
    query:
      'sum by (pod, namespace)(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""})',
  },
  {
    name: 'Memory Usage (by Appwrapper)',
    query:
      'sum by (pod, namespace)(container_memory_rss{job="kubelet", metrics_path="/metrics/cadvisor", cluster="", container!=""})',
    unit: Unit.BYTES,
  },
  {
    name: 'CPU Request (by Namespace)',
    query:
      'sum by (namespace) (kube_pod_container_resource_requests{job="kube-state-metrics", cluster="", resource="cpu"})',
  },
  {
    name: 'Memory request (by Namespace)',
    query:
      'sum by (namespace) (kube_pod_container_resource_requests{job="kube-state-metrics", cluster="", resource="memory"})',
    unit: Unit.BYTES,
  },
];

export const tableQueries = [
  {
    name: 'cpusage',
    query:
      'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""}) by (namespace)',
  },
  {
    name: 'memoryusage',
    query:
      'sum(container_memory_rss{job="kubelet", metrics_path="/metrics/cadvisor", cluster="", container!=""}) by (namespace)',
  },
  {
    name: 'cpurequests',
    query: 'sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) by (namespace)',
  },
  {
    name: 'memoryrequests',
    query:
      'sum(namespace_memory:kube_pod_container_resource_requests:sum{cluster=""}) by (namespace)',
  },
  {
    name: 'cpulimits',
    query: 'sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) by (namespace)',
  },
  {
    name: 'memorylimits',
    query:
      'sum(namespace_memory:kube_pod_container_resource_limits:sum{cluster=""}) by (namespace)',
  },
];
