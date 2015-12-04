import { combineReducers } from 'redux';
import Immutable from 'immutable';

import * as actions from './actions';

export function nodes(state=[], action) {
  switch (action.type) {
    case actions.SET_NODE_ATTRIBUTE:
      return nodes_setNodeAttribute(state, action);
    case actions.INSERT_NODE:
      return nodes_insertNode(state, action);
    case actions.DELETE_NODE:
      return nodes_deleteNode(state, action);
    case actions.MOVE_NODE:
      return nodes_moveNode(state, action);
    default:
      return state;
  }
}

function nodes_setNodeAttribute(state, action) {
  const { name, value } = action;
  const path = action.path.split('.');
  return state.updateIn(path, node => node.set(name, value));
}

function nodes_insertNode(state, action) {
  const { node, position } = action;
  const toPath = action.toPath.split('.');

  // Insert the node into the new position...
  if (position == actions.MovePositions.ADOPT) {
    // Adopt the node into parent, creating the child list if necessary.
    state = state.updateIn(toPath, parent => parent.has('children') ?
        parent.update('children', children => children.unshift(node)) :
        parent.set('children', Immutable.List([node])));
  } else {
    // Insert node before or after toPath, depending on action position
    const index = parseInt(toPath.pop()) +
                  ((position == actions.MovePositions.BEFORE) ? 0 : 1);
    state = state.updateIn(toPath, nodes => nodes.splice(index, 0, node));
  }
  return state;
}

function nodes_deleteNode(state, action) {
  const path = action.path.split('.');
  const index = path.pop();
  if (path.length === 0) {
    // At the outline root, so we only need to splice.
    return state.splice(index, 1);
  }
  path.pop(); // Ignore 'children'
  // If this node is the parent's only child, omit the children list
  // altogether. Otherwise, just splice out the node.
  return state.updateIn(path, parent =>
    parent.get('children').size <= 1 ?
      parent.delete('children') :
      parent.update('children', children => children.splice(index, 1))
  );
}

function nodes_moveNode(state, action) {
  const position = action.position;
  const fromPath = action.fromPath.split('.');
  const toPath = action.toPath.split('.');

  // Grab the node from the tree.
  const node = state.getIn(fromPath);

  // HACK: Set the node null to mark for deletion. Doing this because I'm
  // too lazy to recalculate toPath to compensate for the missing node.
  // Might discover this is regrettably expensive, later.
  state = state.setIn(fromPath, null);

  // Perform the insertion / copy of the node.
  state = nodes_insertNode(state, {toPath: action.toPath, node, position});

  // Omit any nodes marked to be deleted.
  return state.update(omitNullChildNodes);
}

const omitNullChildNodes = (children) =>
    children.filter(node => node !== null).map(node => {
      if (!node.has('children')) { return node; }
      const children = omitNullChildNodes(node.get('children'));
      // If there are no children left after omitting nulls, just omit the
      // children property altogether. Otherwise, use the updated list.
      return children.size === 0 ? node.delete('children') :
                                   node.set('children', children);
    });

export default combineReducers({
  nodes
});
