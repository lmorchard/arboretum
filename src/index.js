import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import * as actions from './lib/actions';
import reducers from './lib/reducers';
import { OutlineApp } from './lib/components';

const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
};

const createStoreWithMiddleware = applyMiddleware(logger)(createStore);

const store = createStoreWithMiddleware(reducers, {
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
    {title: "gamma"}
  ])
});

window.store = store;

ReactDOM.render(
  <Provider store={store}>
    <OutlineApp />
  </Provider>,
  document.getElementById('app')
);
