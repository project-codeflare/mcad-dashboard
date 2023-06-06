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

const MetricGraph = () => {
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
            <Text component={TextVariants.h2}>Example graph</Text>
          </TextContent>
        </div>
      }
    >
      {/* <LineChart></LineChart> */}
    </ExpandableSection>
  );
};

export default MetricGraph;
