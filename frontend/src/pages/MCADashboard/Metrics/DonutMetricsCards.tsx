import React from 'react';
import {
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
  PageSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import DonutMetricCard from './DonutMetricCard';
import { Unit, Query, TotalQuery } from './types';
import { getTotalClusterResourcesData } from './api/metricsData';

type MetricsCardsProps = {
  totalQueries: TotalQuery[];
  queries: { name: string; query: string; unit?: Unit }[];
  name: string;
  refreshRate: number;
};

const DonutMetricsCards: React.FunctionComponent<MetricsCardsProps> = ({
  totalQueries,
  queries,
  name,
  refreshRate,
}: MetricsCardsProps) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const [totalClusterResources, setTotalClusterResources] = React.useState({});

  const getData = async () => {
    const data = await getTotalClusterResourcesData(totalQueries);
    setTotalClusterResources(data);
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <ExpandableSection
      displaySize={'large'}
      onToggle={onToggle}
      isExpanded={isExpanded}
      toggleContent={
        <div>
          <TextContent>
            <Text component={TextVariants.h2}>{name}</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <div>
          <Grid role="list" hasGutter>
            {queries.map((queryItem, index) => {
              return (
                <GridItem key={index} lg={4} md={6} sm={12}>
                  <DonutMetricCard
                    totalClusterResources={totalClusterResources}
                    name={queryItem.name}
                    query={queryItem.query}
                    refreshRate={refreshRate}
                    unit={queryItem.unit}
                  />
                </GridItem>
              );
            })}
          </Grid>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default DonutMetricsCards;
