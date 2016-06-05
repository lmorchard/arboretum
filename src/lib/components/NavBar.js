import React from 'react';
import { connect } from 'react-redux';
import * as storages from '../storages';

const NavBar = React.createClass({
  render() {
    const {dispatch, meta, storage} = this.props;
    return (
      <div>
        {!storage &&
          <button onClick={ev => this.connectDropbox(ev)}>Connect to Dropbox</button>}
        {storage && storage.name === 'dropbox' &&
          <span>Dropbox: {storage.uid}</span>}
      </div>
    );
  },
  connectDropbox(ev) {
    const storage = new storages.DropboxStorage();
    storage.connect();
  }
});

export default connect(({meta, storage}) => ({meta, storage}))(NavBar);
