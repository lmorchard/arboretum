import React from 'react';
import { connect } from 'react-redux';
import { Outline } from '../components';

import stringify from 'json-stringify-pretty-compact';

class OutlineApp extends React.Component {
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
}

export default connect(
  ({meta, nodes}) => ({meta, nodes})
)(OutlineApp);
