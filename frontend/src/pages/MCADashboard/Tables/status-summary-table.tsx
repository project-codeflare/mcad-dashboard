import * as React from 'react';
import {
  PageSection,
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { SortableData } from '../components/table/useTableColumnSort';
import Table from '../components/table/Table';
import { Data } from '../types';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import MCADashboard from '../MCADashboard.css';

interface StatusSummaryData {
  dispatched: string;
  queued: string;
  reenqueued: string;
  failed: string;
  other: string;
}

interface PieChartData {
  x: string;
  y: string | number;
}

export const StatusSummaryTable: React.FunctionComponent<{ data: Data }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  const repositories: StatusSummaryData[] = [
    {
      dispatched: data.stats.statusCounts.Dispatched.toString(),
      queued: data.stats.statusCounts.Queued.toString(),
      reenqueued: data.stats.statusCounts['Re-enqueued'].toString(),
      failed: data.stats.statusCounts.Failed.toString(),
      other: data.stats.statusCounts.Other.toString(),
    },
  ];

  const pieChartData: PieChartData[] = [
    { x: 'Dispatched', y: data.stats.statusCounts.Dispatched },
    { x: 'Queued', y: data.stats.statusCounts.Queued },
    { x: 'Re-enqueued', y: data.stats.statusCounts['Re-enqueued'] },
    { x: 'Failed', y: data.stats.statusCounts.Failed },
    { x: 'Other', y: data.stats.statusCounts.Other },
  ];

  let totalAppWrappers = 0;
  for (const key in data.stats.statusCounts) {
    if (typeof data.stats.statusCounts[key] === 'number') {
      totalAppWrappers += data.stats.statusCounts[key] as number;
    }
  }

  const columns: SortableData<StatusSummaryData>[] = [
    {
      field: 'dispatched',
      label: 'Dispatched',
      sortable: false,
    },
    {
      field: 'queued',
      label: 'Queued',
      sortable: false,
    },
    {
      field: 'reenqueued',
      label: 'Re-enqueued',
      sortable: false,
    },
    {
      field: 'failed',
      label: 'Failed',
      sortable: false,
    },
    {
      field: 'other',
      label: 'Other',
      sortable: false,
    },
  ];

  return (
    <div className="status-summary-wrapper">
      <ExpandableSection
        displaySize={'large'}
        onToggle={onToggle}
        isExpanded={isExpanded}
        toggleContent={
          <div>
            <TextContent>
              <Text component={TextVariants.h2}>Status Summary</Text>
            </TextContent>
          </div>
        }
      >
        <PageSection isFilled data-id="page-content">
          <div className="status-summary-container">
            <div className="chart-donut-status-summary">
              <ChartDonut
                ariaDesc="Average number of pets"
                ariaTitle="Donut chart example"
                constrainToVisibleArea
                data={pieChartData}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                legendData={[
                  { name: 'Dispatched: ' + data.stats.statusCounts.Dispatched },
                  { name: 'Queued: ' + data.stats.statusCounts.Queued },
                  { name: 'Re-enqueued: ' + data.stats.statusCounts['Re-enqueued'] },
                  { name: 'Failed: ' + data.stats.statusCounts.Failed },
                  { name: 'Other: ' + data.stats.statusCounts.Other },
                ]}
                legendOrientation="vertical"
                legendPosition="right"
                name="chart3"
                padding={{
                  bottom: 20,
                  left: 20,
                  right: 140, // Adjusted to accommodate legend
                  top: 20,
                }}
                subTitle="App Warappers"
                title={totalAppWrappers.toString()}
                themeColor={ChartThemeColor.multiOrdered}
                width={350}
              />
            </div>
            <div className="status-summary-table">
              <Table
                aria-label="Appwrapper Summary"
                variant="compact"
                enablePagination
                data={repositories}
                columns={columns}
                emptyTableView={<>No data. </>}
                rowRenderer={(statusSummary) => (
                  <Tr key={statusSummary.dispatched}>
                    <Td dataLabel={statusSummary.dispatched}>{statusSummary.dispatched}</Td>
                    <Td dataLabel={statusSummary.queued}>{statusSummary.queued}</Td>
                    <Td dataLabel={statusSummary.reenqueued}>{statusSummary.reenqueued}</Td>
                    <Td dataLabel={statusSummary.failed}>{statusSummary.failed}</Td>
                    <Td dataLabel={statusSummary.other}>{statusSummary.other}</Td>
                  </Tr>
                )}
              />
            </div>
          </div>
        </PageSection>
      </ExpandableSection>
    </div>
  );
};

export default StatusSummaryTable;
