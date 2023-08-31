import { Query, Unit, TotalQuery } from './types';

export const totalResourceQueries: TotalQuery[] = [
  {
    name: 'Total Utilized CPU %',
    query: 'sum(cluster:capacity_cpu_cores:sum{cluster=""})',
    totalUnit: "Cores",
  },
  {
    name: 'Total Utilized GPU',
    query: 'count(DCGM_FI_PROF_GR_ENGINE_ACTIVE)',
    totalUnit: "GPUs",
  },
  {
    name: 'Utilized CPU (Cores)',
    query: 'sum(cluster:capacity_cpu_cores:sum{cluster=""})',
    totalUnit: "Cores",
  },
  {
    name: 'Total Utilized Memory %',
    query:
      'sum(cluster:capacity_memory_bytes:sum{cluster=""})',
    totalUnit: "B",
  },
  {
    name: 'Total Utilized GPU Memory %',
    query: 'count(DCGM_FI_PROF_GR_ENGINE_ACTIVE)',
    totalUnit: "MB",
  },
  {
    name: 'Utilized Memory',
    query:
      'sum(cluster:capacity_memory_bytes:sum{cluster=""})',
    totalUnit: "B",
  },
];

export const availableResourceQueries: Query[] = [
  {
    name: 'Total Utilized CPU %',
    query: '(cluster:node_cpu:ratio{cluster=""}) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Total Utilized GPU',
    query: 'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"})) or vector(0)',
  },
  {
    name: 'Utilized CPU (Cores)',
    query:
      'sum(cluster:cpu_usage_cores:sum{cluster=""})',
  },
  {
    name: 'Total Utilized Memory %',
    query: '(cluster:memory_usage:ratio{cluster=""}) * 100',
    unit: Unit.PERCENT,
  },
  {
    name: 'Total Utilized GPU Memory %',
    query: 'count(count by (UUID,GPU_I_ID) (DCGM_FI_DEV_MEM_COPY_UTIL))',
    unit: Unit.PERCENT,
  },
  {
    name: 'Utilized Memory',
    query:
      '(sum(cluster:memory_usage_bytes:sum{cluster=""}))',
    unit: Unit.BYTES,
  },
  // / 1048576 - convert bytes to MIB
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
    name: 'Network Usage (by Appwrapper) - Rate of Transmitted Packets Over the Last 5 Minutes',
    query:
      'sum(irate(container_network_transmit_packets_total{job="kubelet", metrics_path="/metrics/cadvisor", cluster="", namespace=~".+"}[5m])) by (pod, namespace)',
    unit: Unit.PPS,
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
  {
    name: 'Utilized GPU (by Appwrapper)',
    query:
      'count (DCGM_FI_DEV_GPU_UTIL) by (exported_pod, exported_namespace)',
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
  {
    name: 'rateoftransmittedpackets',
    query:
      'sum(irate(container_network_transmit_packets_total{job="kubelet", metrics_path="/metrics/cadvisor", cluster="", namespace=~".+"}[5m])) by (namespace)',
  },
  {
    name: 'gpu',
    query:
      'count (DCGM_FI_DEV_GPU_UTIL) by (exported_pod, exported_namespace)',
  },
  // {
  //   name: 'gpumemory',
  //   query:
  //     'count(DCGM_FI_DEV_MEM_COPY_UTIL) by (exported_namespace)',
  // },
];

export const mcadPromQueries: Query[] = [
  {
    name: 'Total Appwrapper Count by Status',
    query: 'appwrapper_count',
  },
  {
    name: 'Appwrapper Status',
    query: 'appwrapper_status',
  },
];