import React from 'react';
import { Tabs, Tab, TabTitleText, TabTitleIcon } from '@patternfly/react-core';
//import UsersIcon from '@patternfly/react-icons/dist/esm/icons/users-icon';
// import BoxIcon from '@patternfly/react-icons/dist/esm/icons/box-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
// import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
// import LaptopIcon from '@patternfly/react-icons/dist/esm/icons/laptop-icon';
import DeezerIcon from '@patternfly/react-icons/dist/esm/icons/deezer-icon';
import ProjectDiagramIcon from '@patternfly/react-icons/dist/esm/icons/project-diagram-icon';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import ApplicationsPage from '~/pages/ApplicationsPage';
import { useUser } from '~/redux/selectors';
import MCADashboard from './MCADashboard';
import Metrics from './Metrics/Metrics';
import Resources from './Metrics/Resources';

const description = 'A Dashboard for Multi-Cluster App Dispatcher';
const subDescription =
  '- MCAD is a Kubernetes controller providing mechanisms for applications to manage batch jobs in a single or multi-cluster environment';

export const MCADTabs: React.FunctionComponent = () => {
  const { isAdmin } = useUser();
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
        key="tabs-component"
      >
        <Tab
          key="Dashboard"
          eventKey={0}
          title={
            <>
              <TabTitleIcon>
                <DeezerIcon />
              </TabTitleIcon>
              <TabTitleText>Appwrapper Summary</TabTitleText>
            </>
          }
          aria-label="mcad-dashboard-tab"
        >
          <MCADashboard />
        </Tab>
        {isAdmin && (
          <Tab
            key="appwrapperMetrics"
            eventKey={1}
            title={
              <>
                <TabTitleIcon>
                  <ProjectDiagramIcon />
                </TabTitleIcon>
                <TabTitleText>Appwrapper Metrics</TabTitleText>
              </>
            }
            aria-label="appwrapper-metrics-tab"
          >
            {/* Place holder */}
            <Resources activeTabKey={Number(activeTabKey)} />
          </Tab>
        )}
        {isAdmin && (
          <Tab
            key="clusterResources"
            eventKey={2}
            title={
              <>
                <TabTitleIcon>
                  <DatabaseIcon />
                </TabTitleIcon>
                <TabTitleText>Cluster Resources</TabTitleText>
              </>
            }
            aria-label="cluster-resources-tab"
          >
            {/* Place holder */}
            <Metrics activeTabKey={Number(activeTabKey)} />
          </Tab>
        )}
        {/* {isAdmin && (
          <Tab
            key="Server"
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
            Server
          </Tab>
        )}
        {isAdmin && (
          <Tab
            key="System"
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
            System
          </Tab>
        )}
        {isAdmin && (
          <Tab
            key="Stat"
            eventKey={6}
            title={
              <>
                <TabTitleIcon>
                  <BoxIcon />
                </TabTitleIcon>
                <TabTitleText>Stat</TabTitleText>
              </>
            }
            aria-label="stat-tab"
          >
            Network
          </Tab>
        )} */}
      </Tabs>
    </ApplicationsPage >
  );
};

export default MCADTabs;
