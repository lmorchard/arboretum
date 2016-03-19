import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import * as actions from './lib/actions';
import reducers from './lib/reducers';
import { Outline } from './lib/components';

const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
};

const store = createStore(reducers, {
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
}, applyMiddleware(logger));

window.store = store;

ReactDOM.render(
  <Provider store={store}>
    <Outline />
  </Provider>,
  document.getElementById('app')
);
