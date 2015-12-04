import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import * as actions from './actions';

export const Outline = connect(state => {
  return { nodes: state.nodes.toJS() };
})(React.createClass({
  getInitialState() {
    return { selected: null };
  },
  render() {
    const { dispatch, nodes } = this.props;
    const selection = {
      set: (path) => this.setState({ selected: path }),
      get: () => this.state.selected,
      clear: () => this.setState({ selected: null })
    };
    return (
      <OutlineTree path="" dispatch={dispatch} nodes={nodes}
                   selection={selection} />
    );
  },
}));

export const OutlineTree = ({ dispatch, nodes, selection, path }) =>
  <ul className="outline">
    {nodes.map((node, index) =>
      <OutlineNode dispatch={dispatch} selection={selection}
                   node={node} key={index} index={index}
                   path={path + index} />
    )}
  </ul>;

export const OutlineNode = React.createClass({
  getInitialState() {
    return {
      editing: false,
      editorValue: this.props.node.title,
      dragging: false,
      positionPreview: null
    };
  },
  render() {
    const { dispatch, node, path, selection } = this.props;
    const { positionPreview, editing, editorValue, dragging } = this.state;

    const selected = selection.get() === path;

    const style = {
      padding: '0.125em',
      backgroundColor: positionPreview == actions.MovePositions.ADOPT ?
        '#ccc' : 'transparent',
      borderTop: positionPreview == actions.MovePositions.BEFORE ?
        '1px solid #ccc' : '1px solid transparent',
      borderBottom: positionPreview == actions.MovePositions.AFTER ?
        '1px solid #ccc' : '1px solid transparent',
      opacity: dragging ? 0.5 : 1
    };
    const titleStyle = {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      margin: ' 0 0.25em 0 0',
      padding: '0.25em 0.25em',
      border: selected ?
        '1px dashed #ccc' : '1px solid transparent'
    };
    const editorStyle = {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      margin: ' 0 0.25em 0 0',
      padding: '0.25em 0.25em',
      border: '1px solid #ccc'
    };
    const buttonStyle = {
      fontFamily: 'monospace',
      margin: "0 0.25em"
    };

    return (
      <li className="outline-node"
          style={style}
          draggable={true}
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
          onDrop={this.onDrop}>

        <button style={buttonStyle}
                disabled={!node.children}
                onClick={this.onToggleCollapsed}>
          {!node.children ? 'o' : node.collapsed ? '+' : '-'}
        </button>

        <button style={buttonStyle} onClick={this.onDelete}>X</button>

        {selected && editing ?
          <input className="editor"
                 style={editorStyle}
                 autoFocus={true}
                 ref={moveCursorToEnd}
                 type="text"
                 size="50"
                 value={editorValue}
                 onBlur={this.onEditorBlur}
                 onChange={this.onEditorChange} />
          :
          <span className="title" style={titleStyle}
                onClick={this.onSelectionClick}
                onDoubleClick={this.onTitleDoubleClick}>{node.title}</span>}

        {!node.collapsed && node.children &&
          <OutlineTree dispatch={dispatch} selection={selection}
                       path={path + '.children.'} nodes={node.children} />}

      </li>
    );
  },
  onSelectionClick(ev) {
    this.props.selection.set(this.props.path);
  },
  onTitleDoubleClick(ev) {
    this.setState({ editing: true });
  },
  onEditorChange(ev) {
    this.setState({ editorValue: ev.target.value });
  },
  onEditorBlur(ev) {
    const { dispatch, node, path } = this.props;
    dispatch(actions.setNodeAttribute(path, 'title',
                                      this.state.editorValue));
    this.setState({ editing: false });
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
  onDrop(ev) {
    const { dispatch } = this.props;
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
  onDelete(ev) {
    const { dispatch } = this.props;
    dispatch(actions.deleteNode(this.props.path))
    return stahp(ev);
  },
  onToggleCollapsed(ev) {
    const { dispatch, node, path } = this.props;
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

// https://davidwalsh.name/caret-end
function moveCursorToEnd(el) {
  if (!el) { return; }
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}
