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

import { QueryReturnType } from './types';

import MetricCard from './MetricCard';

type MetricsCardsProps = {
  queries: { name: string; query: string; queryReturnType: QueryReturnType }[];
  name: string;
};

const MetricsCards: React.FunctionComponent<MetricsCardsProps> = ({
  queries,
  name,
}: MetricsCardsProps) => {
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
            <Text component={TextVariants.h2}>{name}</Text>
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
                  <MetricCard
                    name={queryItem.name}
                    query={queryItem.query}
                    queryReturnType={queryItem.queryReturnType}
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

export default MetricsCards;
