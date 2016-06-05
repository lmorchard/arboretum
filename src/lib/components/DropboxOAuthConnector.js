import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setStorage } from '../actions';
import * as storages from '../storages';
import { push } from 'react-router-redux'

const DropboxOAuthConnector = React.createClass({
  render() {
    return <p>Connecting...</p>;
  },
  componentDidMount() {
    const {dispatch} = this.props;
    const storage = new storages.DropboxStorage();
    storage._finishConnect().then(data => {
      dispatch(setStorage(storage));
      dispatch(push('/'));
    });
  }
});

export default connect(({storage}) => ({storage}))(DropboxOAuthConnector);
