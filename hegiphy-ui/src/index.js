import React from 'react';
import ReactDOM from 'react-dom';

import { Auth0Provider } from "./react-auth0-spa";
import config from "./config";
import history from "./utils/history";

import App from './App';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const onRedirectCallback = appState => {
  history.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname);
};

ReactDOM.render(
  <Auth0Provider
    domain={config.domain}
    client_id={config.clientId}
    redirect_uri={window.location.origin}
    audience={config.audience}
    onRedirectCallback={onRedirectCallback}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);
