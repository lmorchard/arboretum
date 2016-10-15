require('es6-promise').polyfill();
require('isomorphic-fetch');

import config from './lib/config';

import React from 'react';
import ReactDOM from 'react-dom';

import { createHistory } from 'history';
import { Router, Route, IndexRoute, Link, /* browserHistory, */
         useRouterHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer,
         routerMiddleware, push } from 'react-router-redux'

import Immutable from 'immutable';

import { connect, Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';

import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

import * as actions from './lib/actions';
import reducers from './lib/reducers';

import DropboxOAuthConnector from './lib/components/DropboxOAuthConnector';
import NavBar from './lib/components/NavBar';
import OutlineApp from './lib/components/OutlineApp';

import * as storages from './lib/storages';

const initialData = {
  meta: Immutable.fromJS({
    selected: null
  }),
  nodes: Immutable.fromJS([
    {title: 'Click here to edit.'}
  ])
};

const browserHistory = useRouterHistory(createHistory)({
  basename: config.basePath
});

const store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  }),
  initialData,
  applyMiddleware(
    thunk,
    promise,
    routerMiddleware(browserHistory),
    createLogger()
  )
);

const history = syncHistoryWithStore(browserHistory, store)

window.store = store;

const App = ({children}) => (
  <div>
    <NavBar />
    {children}
  </div>
)

ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={OutlineApp} />
        <Route path="/oauth/dropbox" component={DropboxOAuthConnector} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));
