import React from 'react';
import {
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
  PageSection,
  Gallery,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import MetricCard from './MetricCard';

const queries = [
  { name: 'CPU Utilization', query: 'cluster:node_cpu:ratio_rate5m{cluster=""}' },
  {
    name: 'CPU Requests Commitment',
    query:
      'sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
  },
  {
    name: 'CPU Limits Commitment',
    query:
      'sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
  },
  { name: 'CPU Utilization', query: 'cluster:node_cpu:ratio_rate5m{cluster=""}' },
  {
    name: 'CPU Requests Commitment',
    query:
      'sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
  },
  {
    name: 'CPU Limits Commitment',
    query:
      'sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
  },
];

const MetricsCards: React.FunctionComponent = () => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  return (
    <ExpandableSection
      displaySize={'large'}
      onToggle={onToggle}
      isExpanded={isExpanded}
      toggleContent={
        <div>
          <TextContent>
            <Text component={TextVariants.h2}>Metrics Summary</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <div>
          <Grid role="list" hasGutter>
            {queries.map((queryItem) => {
              return (
                <GridItem lg={4} md={6} sm={12}>
                  <MetricCard name={queryItem.name} query={queryItem.query} />
                </GridItem>
              );
            })}
          </Grid>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default MetricsCards;
