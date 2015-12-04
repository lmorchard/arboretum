import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import * as actions from './actions';

export const Outline = connect(state => {
  return { nodes: state.nodes.toJS() };
})(({ dispatch, nodes }) =>
  <OutlineTree dispatch={dispatch} nodes={nodes} path="" />
);

export const OutlineTree = ({ dispatch, nodes, path }) =>
  <ul className="outline">
    {nodes.map((node, index) =>
      <OutlineNode dispatch={dispatch} node={node}
        key={index} index={index} path={path + index} />
    )}
  </ul>;

export const OutlineNode = React.createClass({
  getInitialState() {
    return {
      dragging: false,
      positionPreview: null
    };
  },
  render() {
    const { dispatch, node, path } = this.props;
    const { positionPreview } = this.state;
    const style = {
      padding: '0.125em',
      backgroundColor: positionPreview == actions.MovePositions.ADOPT ?
        '#ccc' : 'transparent',
      borderTop: positionPreview == actions.MovePositions.BEFORE ?
        '1px solid #ccc' : '1px solid transparent',
      borderBottom: positionPreview == actions.MovePositions.AFTER ?
        '1px solid #ccc' : '1px solid transparent',
      opacity: (this.state.dragging) ? 0.5 : 1
    };
    const titleStyle = {};
    const buttonStyle = { fontFamily: 'monospace', margin: "0 0.25em" };
    return (
      <li className="outline-node"
          style={style}
          draggable={true}
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
          onDrop={this.onDrop.bind(this, dispatch)}>

        {node.children && node.children.length > 0 &&
          <button style={buttonStyle}
                  onClick={this.onToggleCollapsed.bind(this, dispatch)}>
            {node.collapsed ? '+' : '-'}
          </button>}

        <button style={buttonStyle}
                onClick={this.onDelete.bind(this, dispatch)}>X</button>

        <span className="title" style={titleStyle}>{node.title}</span>

        {!node.collapsed && node.children && node.children.length > 0 &&
          <OutlineTree dispatch={dispatch}
                       path={path + '.children.'} nodes={node.children} />}

      </li>
    );
  },
  onDragStart(ev) {
    const { path, node } = this.props;
    setDragMeta(ev, {path});
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', JSON.stringify({path, node}));
    ev.stopPropagation();
    this.setState({ dragging: true });
  },
  onDragEnter(ev) {
    const { path: draggedPath } = getDragMeta(ev);
    if (draggedPath != this.props.path) {
      ev.dataTransfer.dropEffect = 'move';
    }
    return stahp(ev);
  },
  onDragOver(ev) {
    const { path: draggedPath } = getDragMeta(ev);
    // Ensure the drop target is not the dragged node or a child
    if (this.props.path.indexOf(draggedPath) !== 0) {
      const rect = ev.target.getBoundingClientRect();
      // TODO: Get rid of the magic number here for defining the zone width
      // that defines whether the drop will be an adoption or before/after
      const pos = (ev.clientX > (rect.left + 50)) ? 'ADOPT' :
                  (ev.clientY < (rect.top + rect.height / 2)) ? 'BEFORE' :
                  'AFTER';
      this.setState({ positionPreview: actions.MovePositions[pos] });
    }
    return stahp(ev);
  },
  onDragLeave(ev) {
    this.setState({ positionPreview: null });
    return stahp(ev);
  },
  onDragEnd(ev) {
    this.setState({ dragging: false });
    return stahp(ev);
  },
  onDrop(dispatch, ev) {
    // TODO: Accept drops from outside the browser.
    const { path: draggedPath } = getDragMeta(ev);
    const data = JSON.parse(ev.dataTransfer.getData('text'));
    // Ensure the drop target is not the dragged node or a child
    if (this.props.path.indexOf(draggedPath) !== 0) {
      dispatch(actions.moveNode(data.path, this.props.path,
                                this.state.positionPreview));
    }
    this.setState({ positionPreview: null });
    return stahp(ev);
  },
  onDelete(dispatch, ev) {
    dispatch(actions.deleteNode(this.props.path))
    return stahp(ev);
  },
  onToggleCollapsed(dispatch, ev) {
    const { node, path } = this.props;
    dispatch(actions.setNodeAttribute(path, 'collapsed', !node.collapsed ));
    return stahp(ev);
  }
});

function stahp(ev) {
  ev.stopPropagation();
  ev.preventDefault();
}

// HACK: Encode data in type names to circumvent dataTransfer protected mode
// http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html#concept-dnd-p
function setDragMeta(ev, data) {
  Object.keys(data).forEach(key => {
    ev.dataTransfer.setData('x-meta/' + key + '/' + data[key], data[key]);
  });
}

// HACK: Decode data from type names to circumvent dataTransfer protected mode
// http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html#concept-dnd-p
function getDragMeta(ev) {
  const data = {};
  const types = ev.dataTransfer.types;
  for (let i = 0; i < types.length; i++) {
    const parts = types[i].split('/');
    if (parts[0] == 'x-meta') {
      data[parts[1]] = parts[2];
    }
  }
  return data;
}
