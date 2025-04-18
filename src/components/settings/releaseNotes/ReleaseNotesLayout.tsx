import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';

import { mdiClose } from '@mdi/js';
import { Outlet } from 'react-router-dom';
import type { Actions } from '../../../actions/lib/actions';
import { isEscapeKeyPress } from '../../../jsUtils';
import Appear from '../../ui/effects/Appear';
import Icon from '../../ui/icon';
import ErrorBoundary from '../../util/ErrorBoundary';

const messages = defineMessages({
  closeSettings: {
    id: 'settings.app.closeSettings',
    defaultMessage: 'Close settings',
  },
});

interface IProps extends WrappedComponentProps {
  actions?: Actions;
  // eslint-disable-next-line react/no-unused-prop-types
  children?: React.ReactNode;
}

@inject('stores', 'actions')
@observer
class ReleaseNotesLayout extends Component<IProps> {
  private handleKeyDownBound = this.handleKeyDown.bind(this);

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDownBound, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDownBound, false);
  }

  handleKeyDown(e: KeyboardEvent) {
    if (isEscapeKeyPress(e.key)) {
      this.props.actions!.ui.closeSettings();
    }
  }

  render() {
    const { closeSettings } = this.props.actions!.ui;

    const { intl } = this.props;

    return (
      <Appear transitionName="fadeIn-fast">
        <div className="settings-wrapper">
          <ErrorBoundary>
            <button
              type="button"
              className="settings-wrapper__action"
              onClick={closeSettings}
              aria-label={intl.formatMessage(messages.closeSettings)}
            />
            <div className="settings franz-form">
              <Outlet />
              <button
                type="button"
                className="settings__close"
                onClick={closeSettings}
                aria-label={intl.formatMessage(messages.closeSettings)}
              >
                <Icon icon={mdiClose} size={1.35} />
              </button>
            </div>
          </ErrorBoundary>
        </div>
      </Appear>
    );
  }
}

export default injectIntl<'intl', IProps>(ReleaseNotesLayout);
