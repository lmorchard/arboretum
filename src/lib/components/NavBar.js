import React from 'react';
import { connect } from 'react-redux';
import { loadNodes } from '../actions';
import * as storages from '../storages';
import stringify from 'json-stringify-pretty-compact';

const filename = 'foo.json';

const NavBar = React.createClass({
  render() {
    const {dispatch, meta, nodes, storage} = this.props;
    console.log(storage);

    return (
      <div>
        {!storage &&
          <button onClick={ev => this.connectDropbox(ev)}>Connect to Dropbox</button>}
        {storage && storage.name === 'dropbox' &&
          <div>
            <span>Dropbox: {storage.uid}</span>
            <button onClick={ev => this.save(ev)}>Save</button>
            <button onClick={ev => this.load(ev)}>Load</button>
          </div>}
      </div>
    );
  },
  connectDropbox(ev) {
    const storage = new storages.DropboxStorage();
    storage.connect();
  },
  save(ev) {
    const {nodes, storage} = this.props;
    const data = stringify(nodes.toJS());
    storage.put(filename, data).then(result => {
      console.log('save it!', result, data);
    }).catch(result => {
      console.log('oops', result);
    });
  },
  load(ev) {
    const {dispatch, nodes, storage} = this.props;
    storage.get(filename).then(result => {
      console.log('load it!', result);
      const data = JSON.parse(result);
      dispatch(loadNodes(data));
    });
  }
});

export default connect(({meta, nodes, storage}) => ({meta, nodes, storage}))(NavBar);
