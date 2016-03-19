import { combineReducers } from 'redux';
import Immutable, { List } from 'immutable';

import * as actions from './actions';

export function nodes(state=[], action) {
  switch (action.type) {
    case actions.setNodeAttribute.type:
      return nodes_setNodeAttribute(state, action);
    case actions.insertNode.type:
      return nodes_insertNode(state, action);
    case actions.deleteNode.type:
      return nodes_deleteNode(state, action);
    case actions.moveNode.type:
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
  if (position == actions.moveNode.positions.ADOPT ||
      position == actions.moveNode.positions.ADOPT_LAST) {
    // Adopt the node into parent, creating the child list if necessary.
    return state.updateIn(toPath, parent => {
      if (!parent.has('children')) {
        return parent.set('children', List([node]));
      } else if (position === actions.moveNode.positions.ADOPT) {
        return parent.update('children', children => children.unshift(node));
      } else {
        return parent.update('children', children => children.push(node));
      }
    });
  }

  // Insert node before or after toPath, depending on action position
  const index = parseInt(toPath.pop()) +
                ((position == actions.moveNode.positions.BEFORE) ? 0 : 1);
  return state.updateIn(toPath, nodes => nodes.splice(index, 0, node));
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

function omitNullChildNodes(children) {
  return children.filter(node => node !== null).map(node => {
    if (!node.has('children')) { return node; }
    const children = omitNullChildNodes(node.get('children'));
    // If there are no children left after omitting nulls, just omit the
    // children property altogether. Otherwise, use the updated list.
    return children.size === 0 ? node.delete('children') :
                                 node.set('children', children);
  });
}

export default combineReducers({
  nodes
});
