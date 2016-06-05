import config from '../config';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setStorage } from '../actions';
import { DropboxStorage } from '../storages';
import { push } from 'react-router-redux'

class DropboxOAuthConnector extends React.Component {
  render() {
    return <p>Connecting...</p>;
  }
  componentDidMount() {
    const {dispatch} = this.props;
    DropboxStorage.finishConnect().then(storage => {
      dispatch(setStorage(storage));
      dispatch(push('/'));
    });
  }
}

export default connect(
  ({storage}) => ({storage})
)(DropboxOAuthConnector);
