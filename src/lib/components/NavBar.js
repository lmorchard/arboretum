import React from 'react';
import { connect } from 'react-redux';
import { setFilename, loadNodes, setStorage, clearStorage } from '../actions';
import stringify from 'json-stringify-pretty-compact';
import classnames from 'classnames';

import * as storages from '../storages';
import {JSONFormat, OPMLFormat} from '../formats';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    const {storage} = this.props;
    this.state = {
      loading: false,
      filelist: [],
      loadFilename: '',
      saveFilename: ''
    };
  }

  render() {
    const {dispatch, meta, nodes, storage} = this.props;
    const {loading, filelist, saveFilename, loadFilename} = this.state;
    return (
      <div className={classnames("navbar", {loading: loading})}>
        <div className="actions">
          {storage &&
            <span>
              <button onClick={ev => this.newDoc(ev)}>New</button>

              <select style={{ width: '15em' }} value={loadFilename}
                      onChange={(ev) => this.setState({loadFilename: ev.target.value})}>
                {filelist.map((filename, idx) => (
                  <option key={idx} value={filename}>{filename}</option>
                ))}
              </select>
              <button onClick={ev => this.refreshList(ev)}>&#8635;</button>
              <button onClick={ev => this.load(ev)}>Load</button>

              <input type="text" style={{width: '15em'}} value={saveFilename}
                     onChange={(ev) => this.setState({saveFilename: ev.target.value})} />
              <button onClick={ev => this.save(ev)}>Save</button>

            </span>}
        </div>
        <div className="settings">
          {!storage &&
            <button onClick={ev => this.connectDropbox(ev)}>Connect to Dropbox</button>}
          {storage && storage.name === 'DropboxStorage' &&
            <span>Dropbox: {storage.account.email}</span>}
          {storage &&
            <button onClick={ev => this.disconnect(ev)}>Disconnect</button>}
        </div>
      </div>
    );
  }

  componentDidMount() {
    const {dispatch} = this.props;
    this.setState({loading: true});
    storages.restoreConnection().then(storage => {
      this.setState({loading: false});
      if (storage) {
        this.setState({
          filelist: storage.filelist,
          loadFilename: storage.filelist[0]
        });
        dispatch(setStorage(storage));
      }
    });
  }

  connectDropbox(ev) {
    storages.DropboxStorage.startConnect();
  }

  disconnect(ev) {
    const {dispatch, storage} = this.props;
    storage.disconnect().then(result => dispatch(clearStorage()));
  }

  newDoc(ev) {
    const {dispatch, nodes, storage} = this.props;
    this.setState({saveFilename: ''});
    dispatch(loadNodes([
      {title: 'Click here to edit.'}
    ]));
  }

  save(ev) {
    const {nodes, storage} = this.props;
    const {saveFilename} = this.state;
    if (!saveFilename) { return; }
    const data = stringify(nodes.toJS());
    this.setState({loading: true});
    storage.put(saveFilename, data).then(result => {
      this.setState({
        loading: false,
        loadFilename: saveFilename
      });
      this.refreshList(ev);
    });
  }

  load(ev) {
    const {dispatch, nodes, storage} = this.props;
    const {loadFilename} = this.state;
    if (!loadFilename) { return; }
    this.setState({loading: true});
    storage.get(loadFilename).then(result => {
      let format;
      if (loadFilename.indexOf('.opml') !== -1) {
        format = new OPMLFormat();
      } else {
        format = new JSONFormat();
      }
      const data = format.importContent(result);
      this.setState({
        loading: false,
        saveFilename: loadFilename
      });
      dispatch(setFilename(loadFilename));
      dispatch(loadNodes(data));
    });
  }

  refreshList(ev) {
    const {storage} = this.props;
    this.setState({loading: true});
    storage.list().then(filelist => {
      this.setState({
        loading: false,
        filelist: filelist,
        loadFilename: filelist[0]
      });
    });
  }
}

export default connect(
  ({meta, nodes, storage}) => ({meta, nodes, storage})
)(NavBar);
