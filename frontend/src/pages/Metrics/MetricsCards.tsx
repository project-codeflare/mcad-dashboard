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
import { dataEntryToRecord } from '~/utilities/dataEntryToRecord';

type MetricsData = {
  data: any;
};

const MetricsCards: React.FunctionComponent<MetricsData> = ({ data: metricsData }) => {
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
            <GridItem span={12} md={6} lg={4}>
              <MetricCard data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricCard data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricCard data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricCard data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricCard data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricCard data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
          </Grid>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default MetricsCards;
