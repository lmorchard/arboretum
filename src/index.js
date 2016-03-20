require('es6-promise').polyfill();

import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

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

ReactDOM.render(
  <Provider store={store}>
    <Outline />
  </Provider>,
  document.getElementById('app')
);
