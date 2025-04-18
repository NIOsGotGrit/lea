import { noop } from 'lodash';
import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import type { StoresProps } from '../../@types/ferdium-components.types';
import { serverName } from '../../api/apiBase';
import shuffleArray from '../../helpers/array-helpers';
import serverlessLogin from '../../helpers/serverless-helpers';
import type RecipePreview from '../../models/RecipePreview';
import Link from '../ui/Link';
import { H1 } from '../ui/headline';

const messages = defineMessages({
  signupButton: {
    id: 'welcome.signupButton',
    defaultMessage: 'Create a free account',
  },
  loginButton: {
    id: 'welcome.loginButton',
    defaultMessage: 'Login to your account',
  },
  changeServerMessage: {
    id: 'login.changeServerMessage',
    defaultMessage:
      'You are using {serverNameParse} Server, do you want to switch?',
  },
  changeServer: {
    id: 'login.changeServer',
    defaultMessage: 'Change here!',
  },
  serverless: {
    id: 'services.serverless',
    defaultMessage: 'Use Ferdium without an Account',
  },
});

interface IProps extends Partial<StoresProps>, WrappedComponentProps {
  loginRoute: string;
  signupRoute: string;
  changeServerRoute: string;
  recipes: RecipePreview[];
}

@inject('actions')
@observer
class Welcome extends Component<IProps> {
  render(): ReactElement {
    const { loginRoute, signupRoute, changeServerRoute, intl } = this.props;
    let { recipes } = this.props;
    recipes = shuffleArray<RecipePreview>(recipes);
    recipes.length = 8 * 2;

    let serverNameParse = serverName();
    serverNameParse =
      serverNameParse === 'Custom' ? 'a Custom' : serverNameParse;

    return (
      <div className="welcome">
        <div className="welcome__content">
          <img
            src="./assets/images/logo.svg"
            className="welcome__logo"
            alt=""
          />
        </div>
        <div className="welcome__text">
          <H1>Ferdium</H1>
        </div>
        <div className="welcome__buttons">
          <Link to={signupRoute} className="button button__inverted">
            {intl.formatMessage(messages.signupButton)}
          </Link>
          <Link to={loginRoute} className="button">
            {intl.formatMessage(messages.loginButton)}
          </Link>
          <div className="welcome__text__change-server">
            <span>
              {intl.formatMessage(messages.changeServerMessage, {
                serverNameParse,
              })}
            </span>
            <Link to={changeServerRoute} className="button__change-server">
              <span>{intl.formatMessage(messages.changeServer)}</span>
            </Link>
          </div>
          <hr
            className="settings__hr-sections"
            style={{ marginTop: 24, marginBottom: 24, borderStyle: 'solid' }}
          />
          <button
            type="button"
            className="button"
            onClick={() => serverlessLogin(this.props.actions)}
            onKeyDown={noop}
          >
            {intl.formatMessage(messages.serverless)}
          </button>
        </div>
        <div className="welcome__featured-services">
          {recipes.map(recipe => (
            <div key={recipe.id} className="welcome__featured-service">
              <img key={recipe.id} src={recipe.icons?.svg} alt="" />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default injectIntl(Welcome);
