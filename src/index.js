require('es6-promise').polyfill();
require('isomorphic-fetch');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import Immutable from 'immutable';

import { connect, Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';

import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

import stringify from 'json-stringify-pretty-compact';

import * as actions from './lib/actions';
import reducers from './lib/reducers';
import { Outline } from './lib/components';
import { DropboxStorage } from './lib/storages';

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

const logger = createLogger();

const store = createStore(
  combineReducers({...reducers, routing: routerReducer}),
  initialData,
  applyMiddleware(thunk, promise, logger)
);

window.store = store;

const history = syncHistoryWithStore(browserHistory, store)

const AppRoot = ({dispatch, meta, nodes}) =>
  <div>
    <textarea
      style={{ position: 'absolute', display: 'block', top: 0, bottom: 0,
               right: 0, left: '50%', width: '50%' }}
      readOnly={true}
      value={stringify(meta.toJS()) + "\n" + stringify(nodes.toJS())} />
    <Outline {...{dispatch, meta, nodes}} />
  </div>;

const App = connect(({meta, nodes}) => ({meta, nodes}))(AppRoot);

const OAuthDropbox = () => (
  <div>
    <p>HI THERE DROPBOX</p>
  </div>
);

ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
      </Route>
      <Route path="/oauth/dropbox" component={OAuthDropbox} />
    </Router>
  </Provider>,
), document.getElementById('app'));

const storage = new DropboxStorage();
window.storage = storage;
