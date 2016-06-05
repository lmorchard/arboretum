import React from 'react';
import { connect } from 'react-redux';
import { loadNodes, setStorage, clearStorage } from '../actions';
import * as storages from '../storages';
import stringify from 'json-stringify-pretty-compact';

const filename = 'foo.json';

class NavBar extends React.Component {
  render() {
    const {dispatch, meta, nodes, storage} = this.props;
    return (
      <div>
        {!storage &&
          <button onClick={ev => this.connectDropbox(ev)}>Connect to Dropbox</button>}
        {storage && storage.name === 'DropboxStorage' &&
          <span>
            <span>Dropbox: {storage.account.email}</span>
            <button onClick={ev => this.save(ev)}>Save</button>
            <button onClick={ev => this.load(ev)}>Load</button>
          </span>}
        {storage &&
          <button onClick={ev => this.disconnect(ev)}>Disconnect</button>}
      </div>
    );
  }

  componentDidMount() {
    const {dispatch} = this.props;
    storages.restoreConnection().then(storage => {
      if (storage) { dispatch(setStorage(storage)); }
    });
  }

  connectDropbox(ev) {
    storages.DropboxStorage.startConnect();
  }

  disconnect(ev) {
    const {dispatch, storage} = this.props;
    storage.disconnect().then(result => dispatch(clearStorage()));
  }

  save(ev) {
    const {nodes, storage} = this.props;
    const data = stringify(nodes.toJS());
    storage.put(filename, data).then(result => {
      console.log('save it!', result, data);
    }).catch(result => {
      console.log('oops', result);
    });
  }

  load(ev) {
    const {dispatch, nodes, storage} = this.props;
    storage.get(filename).then(result => {
      console.log('load it!', result);
      const data = JSON.parse(result);
      dispatch(loadNodes(data));
    });
  }
}

export default connect(
  ({meta, nodes, storage}) => ({meta, nodes, storage})
)(NavBar);
