import { combineReducers } from 'redux';
import Immutable, { List } from 'immutable';
import { handleActions } from 'redux-actions';

import { setNodeAttribute, insertNode, deleteNode, moveNode } from './actions';

function nodes_setNodeAttribute(state, {payload: {name, value, path}}) {
  return state.updateIn(path.split('.'), node => node.set(name, value));
}

function nodes_insertNode(state, {payload: {node, position, toPath}}) {
  const toPathParts = toPath.split('.');

  // Insert the node into the new position...
  if (position == moveNode.positions.ADOPT ||
      position == moveNode.positions.ADOPT_LAST) {
    // Adopt the node into parent, creating the child list if necessary.
    return state.updateIn(toPathParts, parent => {
      if (!parent.has('children')) {
        return parent.set('children', List([node]));
      } else if (position === moveNode.positions.ADOPT) {
        return parent.update('children', children => children.unshift(node));
      } else {
        return parent.update('children', children => children.push(node));
      }
    });
  }

  // Insert node before or after toPathParts, depending on action position
  const index = parseInt(toPathParts.pop()) +
                ((position == moveNode.positions.BEFORE) ? 0 : 1);
  return state.updateIn(toPathParts, nodes => nodes.splice(index, 0, node));
}

function nodes_deleteNode(state, {payload}) {
  const path = payload.path.split('.');
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

function nodes_moveNode(state, {payload: {position, fromPath, toPath}}) {
  const fromPathParts = fromPath.split('.');
  const toPathParts = toPath.split('.');

  // Grab the node from the tree.
  const node = state.getIn(fromPathParts);

  // HACK: Set the node null to mark for deletion. Doing this because I'm
  // too lazy to recalculate toPathParts to compensate for the missing node.
  // Might discover this is regrettably expensive, later.
  state = state.setIn(fromPathParts, null);

  // Perform the insertion / copy of the node.
  state = nodes_insertNode(state, {payload: {toPath: toPath, node, position}});

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
  nodes: handleActions({
    [setNodeAttribute.type]: nodes_setNodeAttribute,
    [insertNode.type]: nodes_insertNode,
    [deleteNode.type]: nodes_deleteNode,
    [moveNode.type]: nodes_moveNode
  }, [])
});
