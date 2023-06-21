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
import { statusSummaryQueries, graphQueries } from './queries';

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
        {graphQueries.map((query, index) => {
          return (
            <MetricGraph
              key={index}
              query={query}
              time={span}
              activeTabKey={activeTabKey}
              refreshRate={refreshRate}
            />
          );
        })}
      </ApplicationsPage>
    </>
  );
};

export default Metrics;
