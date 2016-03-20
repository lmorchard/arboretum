require('es6-promise').polyfill();

import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';

import * as actions from './lib/actions';
import reducers from './lib/reducers';
import { Outline } from './lib/components';

const initialData = {
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

function logger({ getState }) {
  return (next) => (action) => {
    console.log('will dispatch', action);
    let returnValue = next(action);
    console.log('state after dispatch', getState());
    return returnValue;
  }
}

const store = createStore(
  reducers,
  initialData,
  applyMiddleware(promiseMiddleware, logger)
);

window.store = store;

ReactDOM.render(
  <Provider store={store}>
    <Outline />
  </Provider>,
  document.getElementById('app')
);
