import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';

import * as actions from './actions';
import { getNextNodePath, getPreviousNodePath } from './utils';

export const Outline = connect(state => {
  return { nodes: state.nodes };
})(React.createClass({
  getInitialState() {
    return {
      selected: null,
      editing: null
    };
  },
  render() {
    const { dispatch, nodes } = this.props;
    const root = {
      getState: (name) => this.state[name],
      setState: (data) => this.setState(data),
      getPreviousNodePath: (path) => getPreviousNodePath(nodes, path),
      getNextNodePath: (path) => getNextNodePath(nodes, path),
      select: (path, editing) => !path ? null :
        this.setState({
          selection: path,
          editing: editing ? path : null
        })
    };
    return (
      <OutlineTree path="" dispatch={dispatch} nodes={nodes} root={root} />
    );
  }
}));

export const OutlineTree = ({ dispatch, nodes, root, path }) =>
  <ul className="outline">
    {nodes.map((node, index) =>
      <OutlineNode dispatch={dispatch} root={root}
                   node={node} key={index} index={index}
                   path={path + index} />
    )}
  </ul>;

export const OutlineNode = React.createClass({
  getInitialState() {
    return {
      editorValue: this.props.node.get('title'),
      dragging: false,
      positionPreview: null
    };
  },
  render() {
    const { dispatch, node, path, root } = this.props;
    const { positionPreview, editorValue, dragging } = this.state;

    // HACK: Disable dragging when any node is edited.
    // On Firefox, input fields don't receive mouse clicks
    // when a parent has draggable=true
    //
    // https://bugzilla.mozilla.org/show_bug.cgi?id=800050
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1189486
    const selected = root.getState('selection') === path;
    const editing = root.getState('editing') === path;
    const draggable = !editing;
    const hasChildren = node.has('children');
    const isCollapsed = !!node.get('collapsed');

    return (
      <li className={classNames({
            'outline-node': true,
            'editing': editing,
            'dragging': dragging,
            'selected': selected,
            'has-children': hasChildren,
            'collapsed': isCollapsed,
            'position-preview-adopt':
              positionPreview == actions.MovePositions.ADOPT,
            'position-preview-before':
              positionPreview == actions.MovePositions.BEFORE,
            'position-preview-after':
              positionPreview == actions.MovePositions.AFTER,
          })}
          draggable={draggable}
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
          onDrop={this.onDrop}>

        <div className="content">

          <button className="collapse"
                  disabled={!hasChildren}
                  onClick={this.onToggleCollapsed}>
            &nbsp;
          </button>

          {!selected ? null :
            <button className="delete"
                    onClick={this.onDelete}>X</button>}

          {selected && editing ?
            <input className="editor"
                   autoFocus={true}
                   ref={moveCursorToEnd}
                   type="text"
                   size="50"
                   value={editorValue}
                   onKeyDown={this.onEditorKeyDown}
                   onKeyUp={this.onEditorKeyUp}
                   onBlur={this.onEditorBlur}
                   onChange={this.onEditorChange} />
            :
            <span className="title"
                  onClick={this.onSelectionClick}
                  onDoubleClick={this.onTitleDoubleClick}>{node.get('title')}</span>}

        </div>

        {!isCollapsed && hasChildren &&
          <OutlineTree dispatch={dispatch} root={root}
                       path={path + '.children.'} nodes={node.get('children')} />}

      </li>
    );
  },
  setEditing(isEditing) {
    const { root, path } = this.props;
    if (isEditing) {
      // HACK: Track editing on the root state, so we can disable all dragging
      root.setState({ editing: path, selection: path });
    } else {
      root.setState({ editing: null, selection: null });
    }
  },
  onSelectionClick(ev) {
    this.props.root.setState({ selection: this.props.path });
  },
  onTitleDoubleClick(ev) {
    this.editorStart();
  },
  onEditorKeyDown(ev) {
    const { dispatch, root, path } = this.props;
    switch (ev.key) {
      case 'Tab':
        if (ev.shiftKey) {
          // On Shift-Tab, move the node to after its parent.
          var parentPath = path.split('.').slice(0, -2).join('.');
          if (parentPath) {
            this.editorCommit();
            dispatch(actions.moveNode(path, parentPath,
                                      actions.MovePositions.AFTER));
          }
        } else {
          // On Tab, adopt the node as last child of previous sibling.
          var parts = path.split('.');
          var index = parseInt(parts.pop());
          if (index - 1 >= 0) {
            var newPath = parts.concat([index - 1]).join('.');
            this.editorCommit();
            dispatch(actions.moveNode(path, newPath,
                                      actions.MovePositions.ADOPT_LAST));
          }
        }
        return stahp(ev);
    }
  },
  onEditorKeyUp(ev) {
    const { dispatch, root, path } = this.props;
    switch (ev.key) {
      case 'Escape':
        stahp(ev);
        return this.editorCancel();
      case 'Enter':
        stahp(ev);
        return this.editorCommit();
      case 'ArrowUp':
        root.select(root.getPreviousNodePath(path), true);
        return stahp(ev);
      case 'ArrowDown':
        root.select(root.getNextNodePath(path), true);
        return stahp(ev);
    }
  },
  onEditorChange(ev) {
    this.setState({ editorValue: ev.target.value });
  },
  onEditorBlur(ev) {
    this.editorCommit();
  },
  editorStart() {
    this.setState({ editorValue: this.props.node.get('title') });
    this.setEditing(true);
  },
  editorCancel() {
    this.setEditing(false);
  },
  editorCommit() {
    const { dispatch, node, path } = this.props;
    if (this.state.editorValue !== this.props.node.get('title')) {
      dispatch(actions.setNodeAttribute(
        path, 'title', this.state.editorValue));
    }
    this.setEditing(false);
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
    dispatch(actions.setNodeAttribute(path, 'collapsed', !node.get('collapsed') ));
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
