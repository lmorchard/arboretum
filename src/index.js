require('es6-promise').polyfill();
require('isomorphic-fetch');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';
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
    {title: "alpha"},
    {title: "beta", children: [
      {title: "foo"},
      {title: "bar", children: [
        {title: "quux"},
        {title: "xyzzy"}
      ]},
      {title: "baz"}
    ]},
    {title: "gamma"},
    {title: "level1", children: [
      {title: 'level2', children: [
        {title: 'level3', children: [
          {title: 'level4'}
        ]}
      ]}
    ]},
    {title: 'thud'}
  ])
};

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
  </Provider>,
), document.getElementById('app'));
