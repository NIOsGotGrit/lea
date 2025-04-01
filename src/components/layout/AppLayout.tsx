import { ipcRenderer } from 'electron';
import { TitleBar } from 'electron-react-titlebar/renderer';
import { observer } from 'mobx-react';
import type React from 'react';
import { Component, type PropsWithChildren } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import injectSheet, { type WithStylesProps } from 'react-jss';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { mdiFlash, mdiPowerPlug } from '@mdi/js';
import { Outlet } from 'react-router-dom';
import { Component as BasicAuth } from '../../features/basicAuth';
import { Component as PublishDebugInfo } from '../../features/publishDebugInfo';
import { Component as QuickSwitch } from '../../features/quickSwitch';
import { updateVersionParse } from '../../helpers/update-helpers';
import InfoBar from '../ui/InfoBar';
import ErrorBoundary from '../util/ErrorBoundary';

import { isMac, isSnap, isWindows } from '../../environment';
import Todos from '../../features/todos/containers/TodosScreen';
import { workspaceStore } from '../../features/workspaces';
import WorkspaceSwitchingIndicator from '../../features/workspaces/components/WorkspaceSwitchingIndicator';
import AppUpdateInfoBar from '../AppUpdateInfoBar';
import Icon from '../ui/icon';

import LockedScreen from '../../containers/auth/LockedScreen';
import type SettingsStore from '../../stores/SettingsStore';
// import UIStore from '../../stores/UIStore';

const messages = defineMessages({
  servicesUpdated: {
    id: 'infobar.servicesUpdated',
    defaultMessage: 'Your services have been updated.',
  },
  buttonReloadServices: {
    id: 'infobar.buttonReloadServices',
    defaultMessage: 'Reload services',
  },
  requiredRequestsFailed: {
    id: 'infobar.requiredRequestsFailed',
    defaultMessage: 'Could not load services and user information',
  },
  authRequestFailed: {
    id: 'infobar.authRequestFailed',
    defaultMessage:
      'There were errors while trying to perform an authenticated request. Please try logging out and back in if this error persists.',
  },
});

// Comment out original transition for now
// const transition = window?.matchMedia('(prefers-reduced-motion: no-preference)')
//   ? 'transform 0.5s ease'
//   : 'none';

const styles = (theme: any) => ({ // Use theme 'any' for now if drawer width type is complex
  /* Comment out original appContent style
  appContent: {
    // width: `calc(100% + ${theme.workspaces.drawer.width}px)`,
    width: '100%',
    transition,
    transform() {
      return workspaceStore.isWorkspaceDrawerOpen
        ? 'translateX(0)'
        : `translateX(-${theme.workspaces.drawer.width}px)`;
    },
  },
  */
  titleBar: {
    display: 'block',
    zIndex: 1,
    width: '100%',
    height: '10px',
    position: 'absolute',
    top: 0,
  },
  // New Grid Styles
  appGrid: {
    display: 'grid',
    height: '100vh',
    // Add chat column: Use CSS variable, default 0px
    gridTemplateColumns: 'var(--drawer-width, 0px) auto 1fr var(--chat-width, 0px)', 
    gridTemplateRows: 'auto 1fr', 
    gridTemplateAreas: `
      "title title title title"
      "drawer sidebar main chat"
    `,
    // Add transition for the column size change
    transition: 'grid-template-columns 0.3s ease-out', 
  },
  titleArea: {
    gridArea: 'title',
    height: '28px', 
    WebkitAppRegion: 'drag', 
    zIndex: 1,
    // Add a background color matching the theme maybe?
    // backgroundColor: theme.colorBackground, 
  },
  // New area for the workspace drawer
  workspacesDrawerArea: {
    gridArea: 'drawer',
    overflow: 'hidden', // Hide content when width is 0
    backgroundColor: theme.workspaces?.drawer?.background || theme.colorBgd || '#222', // Use theme color or fallback
    // borderRight: `1px solid ${theme.colorDivider || '#444'}`, // Add a divider border
    zIndex: 0, // Keep below title area
  },
  sidebarArea: {
    gridArea: 'sidebar',
    overflow: 'hidden',
    zIndex: 0, 
  },
  mainArea: {
    gridArea: 'main',
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden', 
    zIndex: 0,
  },
  mainAreaContent: { // Container for the actual scrollable content within mainArea
    flexGrow: 1,
    overflowY: 'auto', // Allow scrolling for infobars, services, outlet, todos
    display: 'flex', // Can use flex column here too
    flexDirection: 'column',
  },
  serviceWebViewArea: { // Container specifically for services + outlet
     flexGrow: 1, // Allow this area to grow within mainAreaContent's flex column
     display: 'flex', 
  },
  // New area for the chat panel
  chatPanelArea: {
    gridArea: 'chat',
    overflow: 'hidden', // Hide content when width is 0
    backgroundColor: theme.chatPanel?.background || theme.colorBgd || '#eee', // Use theme or fallback
    borderLeft: `1px solid ${theme.colorDivider || '#ccc'}`, // Divider
    zIndex: 0, // Keep below title area
  },
  tooltip: {
    zIndex: 9999, // High z-index to ensure it's above everything
    position: 'relative',
  },
});

const toggleFullScreen = () => {
  ipcRenderer.send('window.toolbar-double-clicked');
};

interface IProps extends WrappedComponentProps, WithStylesProps<typeof styles> {
  settings: SettingsStore;
  updateVersion: string;
  isFullScreen: boolean;
  sidebar: React.ReactElement;
  workspacesDrawer: React.ReactElement;
  services: React.ReactElement;
  isAiChatVisible: boolean;
  chatView: React.ReactElement;
  showServicesUpdatedInfoBar: boolean;
  appUpdateIsDownloaded: boolean;
  authRequestFailed: boolean;
  installAppUpdate: () => void;
  showRequiredRequestsError: boolean;
  areRequiredRequestsSuccessful: boolean;
  retryRequiredRequests: () => void;
  areRequiredRequestsLoading: boolean;
}

interface IState {
  shouldShowAppUpdateInfoBar: boolean;
  shouldShowServicesUpdatedInfoBar: boolean;
}

@observer
class AppLayout extends Component<PropsWithChildren<IProps>, IState> {
  constructor(props) {
    super(props);

    this.state = {
      shouldShowAppUpdateInfoBar: true,
      shouldShowServicesUpdatedInfoBar: true,
    };
  }

  render() {
    const {
      classes,
      isFullScreen,
      workspacesDrawer,
      sidebar,
      services,
      isAiChatVisible,
      chatView,
      showServicesUpdatedInfoBar,
      appUpdateIsDownloaded,
      authRequestFailed,
      installAppUpdate,
      settings,
      showRequiredRequestsError,
      areRequiredRequestsSuccessful,
      retryRequiredRequests,
      areRequiredRequestsLoading,
      updateVersion,
    } = this.props;

    const { intl } = this.props;

    const { locked, automaticUpdates } = settings.app;
    if (locked) {
      return <LockedScreen />;
    }

    // Get drawer state directly from the imported store
    const isWorkspaceDrawerOpen = workspaceStore.isWorkspaceDrawerOpen;

    // Define the style object separately
    const gridStyle: React.CSSProperties & { [key: string]: any } = {
      '--drawer-width': isWorkspaceDrawerOpen ? '250px' : '0px',
      '--chat-width': isAiChatVisible ? '350px' : '0px',
    };

    return (
      <>
        <ErrorBoundary>
          <div 
            className={classes.appGrid} 
            style={gridStyle}
          > 
            {/* Render Title Area */} 
            <div className={classes.titleArea}> 
              {/* Render original TitleBar/span logic inside title area? */} 
              {isWindows && !isFullScreen && (
                <TitleBar
                  menu={window['ferdium'].menu.template}
                  icon="assets/images/logo.svg"
                />
              )}
              {isMac && !isFullScreen && (
                <span
                  onDoubleClick={toggleFullScreen} // Keep double click toggle
                  style={{ display: 'block', height: '100%' }} // Ensure span takes up area
                />
              )}
            </div>

            {/* Render Workspace Drawer in its area */} 
            <div className={classes.workspacesDrawerArea}> 
               {/* Render drawer content - always rendering might be smoother? Test conditional later if needed.*/} 
               {workspacesDrawer}
            </div>

            {/* Render Sidebar in its area */} 
            <div className={classes.sidebarArea}> 
              {sidebar}
            </div>

            {/* Render Main Area */} 
            <div className={classes.mainArea}> 
               {/* Content inside main area, now wraps scrollable parts */} 
              <div className={classes.mainAreaContent}>
                <WorkspaceSwitchingIndicator />
                {!areRequiredRequestsSuccessful &&
                  showRequiredRequestsError && (
                    <InfoBar
                      type="danger"
                      ctaLabel="Try again"
                      ctaLoading={areRequiredRequestsLoading}
                      sticky
                      onClick={retryRequiredRequests}
                    >
                      <Icon icon={mdiFlash} />
                      {intl.formatMessage(messages.requiredRequestsFailed)}
                    </InfoBar>
                  )}
                {authRequestFailed && (
                  <InfoBar
                    type="danger"
                    ctaLabel="Try again"
                    ctaLoading={areRequiredRequestsLoading}
                    sticky
                    onClick={retryRequiredRequests}
                  >
                    <Icon icon={mdiFlash} />
                    {intl.formatMessage(messages.authRequestFailed)}
                  </InfoBar>
                )}
                {automaticUpdates &&
                  showServicesUpdatedInfoBar &&
                  this.state.shouldShowServicesUpdatedInfoBar && (
                    <InfoBar
                      type="primary"
                      ctaLabel={intl.formatMessage(
                        messages.buttonReloadServices,
                      )}
                      onClick={() => window.location.reload()}
                      onHide={() => {
                        this.setState({
                          shouldShowServicesUpdatedInfoBar: false,
                        });
                      }}
                    >
                      <Icon icon={mdiPowerPlug} />
                      {intl.formatMessage(messages.servicesUpdated)}
                    </InfoBar>
                  )}
                {automaticUpdates &&
                  (appUpdateIsDownloaded || isSnap) &&
                  this.state.shouldShowAppUpdateInfoBar && (
                    <AppUpdateInfoBar
                      onInstallUpdate={installAppUpdate}
                      updateVersionParsed={updateVersionParse(updateVersion)}
                      onHide={() => {
                        this.setState({ shouldShowAppUpdateInfoBar: false });
                      }}
                    />
                  )}
                <BasicAuth />
                <QuickSwitch />
                <PublishDebugInfo />
                {/* Wrap services and outlet */} 
                <div className={classes.serviceWebViewArea}>
                  {services}
                  <Outlet />
                </div>
                {/* Render Todos at the end of the main scrollable content */} 
                <Todos /> 
              </div>
            </div>
            
            {/* Render Chat Panel in its area */} 
            <div className={classes.chatPanelArea}> 
              {/* Conditionally render content? Or let CSS hide via overflow? Let's render always for now. */} 
              {isAiChatVisible && chatView} 
            </div>
          </div>
          {/* Add tooltip outside the grid */}
          <ReactTooltip
            id="tooltip-sidebar-button"
            place="right"
            variant="dark"
            className={classes.tooltip}
            style={{ height: 'auto', overflowY: 'unset' }}
          />
        </ErrorBoundary>
      </>
    );
  }
}

export default injectIntl(
  injectSheet(styles)(AppLayout),
);
