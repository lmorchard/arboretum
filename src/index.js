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

import stringify from 'json-stringify-pretty-compact';

import * as actions from './lib/actions';
import reducers from './lib/reducers';

import { Outline } from './lib/components';
import DropboxOAuthConnector from './lib/components/DropboxOAuthConnector';
import NavBar from './lib/components/NavBar';

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

const OutlineApp = connect(({meta, nodes}) => ({meta, nodes}))(React.createClass({
  render() {
    const {dispatch, meta, nodes} = this.props;
    return (
      <div>
        <textarea
          style={{ position: 'absolute', display: 'block', top: 0, bottom: 0,
                   right: 0, left: '50%', width: '50%' }}
          readOnly={true}
          value={stringify(meta.toJS()) + "\n" + stringify(nodes.toJS())} />
        <Outline {...{dispatch, meta, nodes}} />
      </div>
    );
  }
}));

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
