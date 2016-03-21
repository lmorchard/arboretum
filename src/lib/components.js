import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Immutable, { List, Map } from 'immutable';

import { setNodeAttribute, insertNode, deleteNode, moveNode, selectNode,
         clearSelection, collapseRecursively } from './actions';

import { getParentNodePath, getNextNodePath, getPreviousNodePath,
         getNextSiblingPath, getPreviousSiblingPath, splitPath,
         keyEvent } from './utils';


export const Outline = connect(state => ({
  meta: state.meta,
  nodes: state.nodes
}))(
  ({ dispatch, meta, nodes }) =>
    <OutlineTree dispatch={dispatch} meta={meta} root={nodes} nodes={nodes}
                 path="" />
);


export const OutlineTree = (props) =>
  <ul className="outline">
    {props.nodes.map((node, index) =>
      <OutlineNode {...props} node={node} siblings={props.nodes}
                   key={index} path={props.path + index} />
    )}
  </ul>;


export const OutlineNode = React.createClass({
  getInitialState() {
    const { node } = this.props;
    return {
      dragging: false,
      positionPreview: null
    };
  },
  render() {
    const { dispatch, meta, root, node, path } = this.props;
    const { positionPreview, dragging } = this.state;

    // HACK: Disable dragging when any node is edited.
    // On Firefox, input fields don't receive mouse clicks
    // when a parent has draggable=true
    //
    // https://bugzilla.mozilla.org/show_bug.cgi?id=800050
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1189486
    const draggable = !meta.get('selected');

    const selected = node.get('selected');
    const hasChildren = node.has('children');
    const isCollapsed = !!node.get('collapsed');

    const { title } = node.toJS();

    const className = classNames({
      'outline-node': true,
      'dragging': dragging,
      'editing': selected,
      'selected': selected,
      'has-children': hasChildren,
      'collapsed': isCollapsed,
      'position-preview-adopt':
        positionPreview == insertNode.positions.ADOPT,
      'position-preview-before':
        positionPreview == insertNode.positions.BEFORE,
      'position-preview-after':
        positionPreview == insertNode.positions.AFTER,
    });

    return (
      <li className={className} draggable={draggable}
          onDragStart={this.onDragStart} onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver} onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd} onDrop={this.onDrop}>

        {selected ?
          <div className="content">
            <button className="delete" onClick={this.onDelete}>X</button>
            <OutlineNodeEditor {...this.props} />
          </div>
          :
          <div className="content">
            <button className="collapse" disabled={!hasChildren}
                    onClick={this.onToggleCollapsed}>&nbsp;</button>
            <span className="title"
                  onClick={this.onSelectionClick}>{title}</span>
          </div>
        }

        {!isCollapsed && hasChildren &&
          <OutlineTree dispatch={dispatch} meta={meta} root={root}
                       nodes={node.get('children')}
                       path={path + '.children.'} />}

      </li>
    );
  },
  onSelectionClick(ev) {
    const { dispatch, path } = this.props;
    dispatch(selectNode(path));
    return stahp(ev);
  },
  onDelete(ev) {
    const { dispatch, path } = this.props;
    dispatch(deleteNode(path))
    return stahp(ev);
  },
  onToggleCollapsed(ev) {
    const { dispatch, node, path } = this.props;
    if (ev.ctrlKey) {
      dispatch(collapseRecursively(path, !node.get('collapsed')));
    } else {
      dispatch(setNodeAttribute(path, 'collapsed', !node.get('collapsed')));
    }
    return stahp(ev);
  },
  onDragStart(ev) {
    const { path, node } = this.props;
    setDragMeta(ev, {path});
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', JSON.stringify({ path }));
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
      this.setState({ positionPreview: insertNode.positions[pos] });
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
      dispatch(moveNode(data.path, this.props.path,
                        this.state.positionPreview));
    }
    this.setState({ positionPreview: null });
    return stahp(ev);
  }
});


export const OutlineNodeEditor = React.createClass({
  getInitialState() {
    const { node } = this.props;
    return { value: node.get('title') };
  },
  componentWillReceiveProps(nextProps) {
    if (this.props.node != nextProps.node) {
      this.setState({ value: nextProps.node.get('title') });
    }
  },
  render() {
    const { value } = this.state;
    return <input className="editor" autoFocus={true} type="text" size="50"
                  value={value} ref={moveCursorToEnd}
                  onKeyDown={this.onKeyDown}
                  onKeyUp={this.onKeyUp}
                  onBlur={this.onBlur}
                  onChange={this.onChange} />;
  },
  resolve(discard=false, deselect=true, preserveEmpty=false) {
    const { dispatch, node, path } = this.props;
    const { value } = this.state;
    if (!preserveEmpty && value == '') {
      dispatch(deleteNode(path));
    } else if (!discard && value !== this.props.node.get('title')) {
      dispatch(setNodeAttribute(path, 'title', value));
    }
    if (deselect) { dispatch(clearSelection()); }
    return value;
  },
  onChange(ev) {
    this.setState({ value: ev.target.value });
  },
  onBlur(ev) {
    // FIXME: This prevents the delete button from working, because focus is
    // blurred by the click and the button disappears before it gets the click.
    // this.resolve();
  },
  onKeyDown(ev) {
    switch (keyEvent(ev)) {
      case 'Shift Tab':        return this.onPromoteNode(ev);
      case 'Tab':              return this.onDemoteNode(ev);
      case 'Ctrl ArrowLeft':   return this.onCollapse(ev, true);
      case 'Ctrl ArrowRight':  return this.onCollapse(ev, false);
      case 'Ctrl ArrowUp':     return this.onCollapseRecursively(ev, true);
      case 'Ctrl ArrowDown':   return this.onCollapseRecursively(ev, false);
      case 'Shift ArrowLeft':  return this.onPromoteNode(ev);
      case 'Shift ArrowRight': return this.onDemoteNode(ev);
      case 'Shift ArrowUp':    return this.onMoveNodeUp(ev);
      case 'Shift ArrowDown':  return this.onMoveNodeDown(ev);
      case 'ArrowUp':          return this.onSelectUp(ev);
      case 'ArrowDown':        return this.onSelectDown(ev);
    }
  },
  onKeyUp(ev) {
    switch (keyEvent(ev)) {
      case 'Enter':       return this.onCommit(ev);
      case 'Shift Enter': return this.onCommit(ev, 'ADOPT');
      case 'Escape':      return this.onCancel(ev);
    }
  },
  onCommit(ev, newPosition='AFTER') {
    const { dispatch, root, nodes, path } = this.props;
    if (this.resolve()) {
      const newNode = new Map({ selected: true, title: '' });
      dispatch(insertNode(newNode, path, insertNode.positions[newPosition]));
    }
    return stahp(ev);
  },
  onCancel(ev) {
    this.resolve(true);
    return stahp(ev);
  },
  onCollapse(ev, collapseValue) {
    const { dispatch, path } = this.props;
    dispatch(setNodeAttribute(path, 'collapsed', collapseValue));
    return stahp(ev);
  },
  onCollapseRecursively(ev, collapseValue) {
    const { dispatch, path } = this.props;
    dispatch(collapseRecursively(path, collapseValue));
    return stahp(ev);
  },
  onSelectUp(ev) {
    const { dispatch, root, path } = this.props;
    const newPath = getPreviousNodePath(root, path);
    if (newPath) {
      this.resolve();
      dispatch(selectNode(newPath));
    }
    return stahp(ev);
  },
  onSelectDown(ev) {
    const { dispatch, root, path } = this.props;
    const newPath = getNextNodePath(root, path);
    if (newPath) {
      this.resolve();
      dispatch(selectNode(newPath));
    }
    return stahp(ev);
  },
  onMoveNodeDown(ev) {
    const { dispatch, root, path } = this.props;
    const newPath = getNextSiblingPath(root, path);
    if (newPath) {
      this.resolve(false, false, true);
      dispatch(moveNode(path, newPath, insertNode.positions.AFTER));
    }
    return stahp(ev);
  },
  onMoveNodeUp(ev) {
    const { dispatch, root, path } = this.props;
    const newPath = getPreviousSiblingPath(root, path);
    if (newPath) {
      this.resolve(false, false, true);
      dispatch(moveNode(path, newPath, insertNode.positions.BEFORE));
    }
    return stahp(ev);
  },
  onPromoteNode(ev) {
    const { dispatch, root, path } = this.props;
    const newPath = getParentNodePath(root, path);
    if (newPath) {
      this.resolve(false, false, true);
      dispatch(moveNode(path, newPath, insertNode.positions.AFTER));
    }
    return stahp(ev);
  },
  onDemoteNode(ev) {
    const { dispatch, root, path } = this.props;
    const newPath = getPreviousSiblingPath(root, path);
    if (newPath) {
      this.resolve(false, false, true);
      dispatch(moveNode(path, newPath, insertNode.positions.ADOPT_LAST));
    }
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
