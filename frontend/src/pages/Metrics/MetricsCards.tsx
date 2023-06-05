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

import MetricTyle from './MetricCard';
import { dataEntryToRecord } from '~/utilities/dataEntryToRecord';

type MetricsData = {
  data: any;
};

const MetricsTyles: React.FunctionComponent<MetricsData> = ({ data: metricsData }) => {
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
            <Text component={TextVariants.h2}>Appwrapper Summary</Text>
          </TextContent>
        </div>
      }
    >
      <PageSection isFilled data-id="page-content">
        <div>
          here
          <Grid role="list" hasGutter>
            <GridItem span={12} md={6} lg={4}>
              <MetricTyle data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricTyle data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricTyle data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricTyle data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricTyle data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
            <GridItem span={12} md={6} lg={4}>
              <MetricTyle data={metricsData.cpuLimit} name={'bruh'} />
            </GridItem>
          </Grid>
        </div>
      </PageSection>
    </ExpandableSection>
  );
};

export default MetricsTyles;
