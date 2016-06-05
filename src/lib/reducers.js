import Immutable, { List, Map } from 'immutable';
import { handleActions } from 'redux-actions';
import { loadNodes, setNodeAttribute,
         insertNode, deleteNode, selectNode,
         setFilename, clearSelection, moveNode, setCollapsed,
         setStorage, clearStorage } from './actions';
import { splitPath } from './utils';

export default {
  meta: handleActions({
    [setFilename.type]: meta_setFilename,
    [selectNode.type]: meta_selectNode,
    [clearSelection.type]: meta_clearSelection,
  }, Map()),
  nodes: handleActions({
    [loadNodes.type]: nodes_loadNodes,
    [setNodeAttribute.type]: nodes_setNodeAttribute,
    [setCollapsed.type]: nodes_setCollapsed,
    [insertNode.type]: nodes_insertNode,
    [deleteNode.type]: nodes_deleteNode,
    [selectNode.type]: nodes_selectNode,
    [clearSelection.type]: nodes_clearSelection,
    [moveNode.type]: nodes_moveNode
  }, List()),
  storage: handleActions({
    [setStorage.type]: storage_setStorage,
    [clearStorage.type]: storage_clearStorage
  }, null)
};

function storage_setStorage(state, {payload: {storage}}) {
  return storage;
}

function storage_clearStorage(state) {
  return null;
}

function meta_setFilename(state, {payload: {filename}}) {
  return state.set('filename', filename);
}

function meta_clearSelection(state) {
  return state.set('selected', null);
}

function meta_selectNode(state, {payload: {path}}) {
  return state.set('selected', path);
}

function nodes_loadNodes(state, {payload: {data}}) {
  return Immutable.fromJS(data);
}

function nodes_setNodeAttribute(state, {payload: {path, name, value}}) {
  return state.updateIn(path.split('.'), node => node.set(name, value));
}

function nodes_setCollapsed(state, {payload: {path, value, recursive}}) {
  const updater = node => {
    if (recursive && node.has('children')) {
      node = node.set('children', node.get('children').map(updater));
    }
    return value && node.has('children') ?
      node.set('collapsed', true) : node.remove('collapsed');
  };
  return state.updateIn(path.split('.'), updater);
}

function nodes_clearSelection(state) {
  const updater = node => {
    if (node.has('children')) {
      node = node.set('children', node.get('children').map(updater));
    }
    return node.remove('selected');
  };
  return state.map(updater);
}

function nodes_selectNode(state, {payload: {path}}) {
  return nodes_clearSelection(state)
    .updateIn(path.split('.'), node => node.set('selected', true));
}

function nodes_insertNode(state, {payload: {node, position, path}}) {
  if (!path) { return state; }

  const pathParts = path.split('.');

  // Insert the node into the new position...
  if (position == insertNode.positions.ADOPT ||
      position == insertNode.positions.ADOPT_LAST) {
    // Adopt the node into parent, creating the child list if necessary.
    return state.updateIn(pathParts, parent => {
      if (!parent.has('children')) {
        return parent.set('children', List([node]));
      } else if (position === insertNode.positions.ADOPT) {
        return parent.update('children', children => children.unshift(node));
      } else {
        return parent.update('children', children => children.push(node));
      }
    });
  }

  // Insert node before or after pathParts, depending on action position
  const index = parseInt(pathParts.pop()) +
                ((position == insertNode.positions.BEFORE) ? 0 : 1);
  return state.updateIn(pathParts, nodes => nodes.splice(index, 0, node));
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
  if (!fromPath || !toPath) { return state; }

  const fromPathParts = fromPath.split('.');
  const toPathParts = toPath.split('.');

  // Grab the node from the tree.
  const node = state.getIn(fromPathParts);

  // HACK: Set the node null to mark for deletion. Doing this because I'm
  // too lazy to recalculate toPathParts to compensate for the missing node.
  // Might discover this is regrettably expensive, later.
  state = state.setIn(fromPathParts, null);

  // Perform the insertion / copy of the node.
  state = nodes_insertNode(state, {payload: {path: toPath, node, position}});

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
