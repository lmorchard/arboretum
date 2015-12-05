import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import * as actions from './actions';

export const Outline = connect(state => {
  return { nodes: state.nodes.toJS() };
})(React.createClass({
  getInitialState() {
    return {
      selected: null,
      editing: false
    };
  },
  render() {
    const { dispatch, nodes } = this.props;
    const rootState = {
      get: (name) => this.state[name],
      set: (name, value) => {
        const data = {};
        data[name] = value;
        this.setState(data);
      }
    };
    return (
      <OutlineTree path="" dispatch={dispatch} nodes={nodes}
                   rootState={rootState} />
    );
  }
}));

export const OutlineTree = ({ dispatch, nodes, rootState, path }) =>
  <ul className="outline">
    {nodes.map((node, index) =>
      <OutlineNode dispatch={dispatch} rootState={rootState}
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
    const { dispatch, node, path, rootState } = this.props;
    const { positionPreview, editing, editorValue, dragging } = this.state;

    const selected = rootState.get('selection') === path;

    const style = {
      listStyleType: 'none',
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
      display: 'block',
      width: '75%',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      margin: ' 0 0.25em 0 0',
      padding: '0.25em 0.25em',
      border: '1px solid #ccc'
    };
    const buttonStyle = {
      fontFamily: 'monospace',
      margin: '0 0.25em'
    };

    // HACK: Disable dragging when any node is edited.
    // On Firefox, input fields don't receive mouse clicks
    // when a parent has draggable=true
    //
    // https://bugzilla.mozilla.org/show_bug.cgi?id=800050
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1189486
    const draggable = !rootState.get('editing');

    return (
      <li className="outline-node"
          style={style}
          draggable={draggable}
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
          <OutlineTree dispatch={dispatch} rootState={rootState}
                       path={path + '.children.'} nodes={node.children} />}

      </li>
    );
  },
  setEditing(isEditing) {
    this.setState({ editing: isEditing });
    // HACK: Track editing on the root state, so we can disable all dragging
    this.props.rootState.set('editing', isEditing);
  },
  onSelectionClick(ev) {
    this.props.rootState.set('selection', this.props.path);
  },
  onTitleDoubleClick(ev) {
    this.setEditing(true);
  },
  onEditorChange(ev) {
    this.setState({ editorValue: ev.target.value });
  },
  onEditorBlur(ev) {
    const { dispatch, node, path } = this.props;
    if (this.state.editorValue !== this.props.node.title) {
      dispatch(actions.setNodeAttribute(
        path, 'title', this.state.editorValue));
    }
    this.setEditing(false);
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
