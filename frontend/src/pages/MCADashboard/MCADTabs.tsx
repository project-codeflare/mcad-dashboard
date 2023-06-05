import React from 'react';
import { Tabs, Tab, TabTitleText, TabTitleIcon } from '@patternfly/react-core';
import UsersIcon from '@patternfly/react-icons/dist/esm/icons/users-icon';
import BoxIcon from '@patternfly/react-icons/dist/esm/icons/box-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import LaptopIcon from '@patternfly/react-icons/dist/esm/icons/laptop-icon';
import ProjectDiagramIcon from '@patternfly/react-icons/dist/esm/icons/project-diagram-icon';
import MCADashboard from './MCADashboard';
import ApplicationsPage from '../ApplicationsPage';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import Metrics from '../Metrics/Metrics';

const description = 'A Dashboard for Multi-Cluster App Dispatcher';
const subDescription =
  '- MCAD is a Kubernetes controller providing mechanisms for applications to manage batch jobs in a single or multi-cluster environment';

export const MCADTabs: React.FunctionComponent = () => {
  const { components, loaded, loadError } = useWatchComponents(true);
  const isEmpty = !components || components.length === 0;
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  // Toggle currently active tab
  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <ApplicationsPage
      title="MCAD Dashboard"
      description={description}
      loaded={loaded}
      empty={isEmpty}
      loadError={loadError}
    >
      <div className="mcad-description">
        <p>{subDescription}</p>
      </div>
      <Tabs
        className="mcad-tabs"
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label="mcad-tabs"
      >
        <Tab
          eventKey={0}
          title={
            <>
              <TabTitleIcon>
                <UsersIcon />
              </TabTitleIcon>
              <TabTitleText>Dashboard</TabTitleText>
            </>
          }
          aria-label="mcad-dashboard-tab"
        >
          <MCADashboard />
        </Tab>
        <Tab
          eventKey={1}
          title={
            <>
              <TabTitleIcon>
                <BoxIcon />
              </TabTitleIcon>
              <TabTitleText>Resources</TabTitleText>
            </>
          }
          aria-label="resources-tab"
        >
          {/* Place holder */}
          Resources
        </Tab>
        <Tab
          eventKey={2}
          title={
            <>
              <TabTitleIcon>
                <DatabaseIcon />
              </TabTitleIcon>
              <TabTitleText>Metrics</TabTitleText>
            </>
          }
          aria-label="metrics-tab"
        >
          {/* Place holder */}
          Metrics
          <Metrics />
        </Tab>
        <Tab
          eventKey={3}
          title={
            <>
              <TabTitleIcon>
                <ServerIcon />
              </TabTitleIcon>
              <TabTitleText>Server</TabTitleText>
            </>
          }
          aria-label="server-tab"
        >
          {/* Place holder */}
          Server
        </Tab>
        <Tab
          eventKey={4}
          title={
            <>
              <TabTitleIcon>
                <LaptopIcon />
              </TabTitleIcon>
              <TabTitleText>System</TabTitleText>
            </>
          }
          aria-label="system-tab"
        >
          {/* Place holder */}
          System
        </Tab>
        <Tab
          eventKey={6}
          title={
            <>
              <TabTitleIcon>
                <ProjectDiagramIcon />
              </TabTitleIcon>
              <TabTitleText>Stat</TabTitleText>
            </>
          }
          aria-label="stat-tab"
        >
          {/* Place holder */}
          Network
        </Tab>
      </Tabs>
    </ApplicationsPage>
  );
};

export default MCADTabs;
