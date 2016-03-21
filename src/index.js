require('es6-promise').polyfill();

import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import { connect, Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

import stringify from 'json-stringify-pretty-compact';

import * as actions from './lib/actions';
import reducers from './lib/reducers';
import { Outline } from './lib/components';

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
  reducers,
  initialData,
  applyMiddleware(thunk, promise, logger)
);

window.store = store;

const AppRoot = ({dispatch, meta, nodes}) =>
  <div>
    <textarea
      style={{ position: 'absolute', display: 'block', top: 0, bottom: 0,
               right: 0, left: '50%', width: '50%' }}
      readOnly={true}
      value={stringify(meta.toJS()) + "\n" + stringify(nodes.toJS())} />
    <Outline {...{dispatch, meta, nodes}} />
  </div>

const App = connect(({meta, nodes}) => ({meta, nodes}))(AppRoot);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
