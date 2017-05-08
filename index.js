require('file-loader?name=[name].[ext]!./index.html');
require('./index.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';

import { createInitialStore } from './app/store';

import { Outline } from './app/components';

import * as formatOPML from './lib/formats/OPML';
const sampleOutlineData = require('./test/_fixtures/states.opml');

const store = window.store = createInitialStore({
  outline: formatOPML.parse(sampleOutlineData)
});

const App = connect(
  (state) => state,
  (dispatch) => ({
    dispatch
  }),
  (stateProps, dispatchProps, ownProps) => Object.assign({
  }, ownProps, stateProps, dispatchProps)
)(props => (
  <Outline {...props} />
));

ReactDOM.render((
  <Provider store={store}>
    <App txt="hello!" />
  </Provider>
), document.getElementById('app'));
