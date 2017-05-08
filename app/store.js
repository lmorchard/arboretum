import Immutable from 'immutable';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createActions, handleActions, combineActions } from 'redux-actions';
import { createSelector } from 'reselect';
import promiseMiddleware from 'redux-promise';
import { createLogger } from 'redux-logger';

import { symbols, makeGenID } from '../lib/utils';

const genId = makeGenID();

const initialData = (data = {}) => ({
  outline: Immutable.fromJS(data.outline || { meta: {}, root: [], nodes: {} })
});

export function createInitialStore(data) {
  return createStore(
    combineReducers({
      outline: outlineReducers
    }),
    initialData(data),
    applyMiddleware(
      promiseMiddleware,
      // createLogger()
    )
  );
}

export const createNode = attributes => Immutable.fromJS({
  id: genId(),
  parent: null,
  expanded: false,
  children: [],
  attributes: attributes || {}
});

export const positions = symbols('BEFORE', 'AFTER', 'ADOPT', 'ADOPT_FIRST');

export const outlineActions = createActions({

  UPDATE_NODE: (nodeId, attributes) => ({ nodeId, attributes }),

  SET_NODE_EXPANDED: (nodeId, expanded) => ({ nodeId, expanded }),

  INSERT_NODE: (node, position = positions.ADOPT, contextId) =>
    ({ node, position, contextId }),

  MOVE_NODE: (nodeId, position = positions.ADOPT, contextId) =>
    ({ nodeId, position, contextId }),

  DELETE_NODE: (nodeId) => ({ nodeId })

});

export const outlineReducers = handleActions({

  UPDATE_NODE: (state, { payload: { nodeId, attributes }}) =>
    state.mergeIn(['nodes', nodeId, 'attributes'], attributes),

  SET_NODE_EXPANDED: (state, { payload: { nodeId, expanded }}) =>
    state.mergeIn(['nodes', nodeId, 'expanded'], !!expanded),

  INSERT_NODE: (state, { payload: { node, position, contextId } }) => {
    const parent = findParentId(state, position, contextId);
    const rootPath = parent ? ['nodes', parent, 'children'] : ['root'];
    const insertIdx = findInsertIdx(state, rootPath, position, contextId);
    const id = node.get('id');

    return state
      .updateIn(rootPath, root => root.splice(insertIdx, 0, id))
      .update('nodes', nodes => nodes.set(id, node.set('parent', parent)));
  },

  MOVE_NODE: (state, { payload: { nodeId, position, contextId } }) => {
    const removeParent = state.getIn(['nodes', nodeId, 'parent']);
    const removePath = removeParent ? ['nodes', removeParent, 'children'] : ['root'];
    const removeIdx = state.getIn(removePath).findIndex(v => v === nodeId);

    const parent = findParentId(state, position, contextId);
    const newPath = parent ? ['nodes', parent, 'children'] : ['root'];
    const insertIdx = findInsertIdx(state, newPath, position, contextId);

    return state
      .setIn(['nodes', nodeId, 'parent'], parent)
      .updateIn(removePath, root => root.splice(removeIdx, 1))
      .updateIn(newPath, root => root.splice(insertIdx, 0, nodeId));
  },

  DELETE_NODE: (state, { payload: { nodeId } }) => {
    const removeParent = state.getIn(['nodes', nodeId, 'parent']);
    const removePath = removeParent ? ['nodes', removeParent, 'children'] : ['root'];
    const removeIdx = state.getIn(removePath).findIndex(v => v === nodeId);

    return state
      .updateIn(removePath, root => root.splice(removeIdx, 1))
      .deleteIn(['nodes', nodeId]);
  }

}, initialData());

/** public selectors */

export const getNodes = (state) => state.outline.get('nodes');

export const getRootNodeIds = (state) => state.outline.get('root');

export const getRootNodes = createSelector(
  [ getRootNodeIds, getNodes ],
  (rootNodeIds, nodes) => rootNodeIds.map(id => nodes.get(id))
);

export const getNodeById = (state, id) => state.outline.getIn(['nodes', id]);

/** private utilities */

function findParentId(state, position, contextId) {
  let parent;
  if (contextId) {
    if (position === positions.ADOPT || position === positions.ADOPT_FIRST) {
      parent = contextId;
    } else if (position === positions.BEFORE || position == positions.AFTER) {
      parent = state.getIn(['nodes', contextId, 'parent']);
    }
  }
  return parent;
}

function findInsertIdx(state, rootPath, position, contextId) {
  let insertIdx;
  if (position === positions.ADOPT_FIRST) {
    insertIdx = 0;
  } else if (position === positions.ADOPT) {
    insertIdx = state.getIn(rootPath).count();
  } else {
    insertIdx = state.getIn(rootPath).findIndex(v => v === contextId);
    if (position === positions.AFTER) { insertIdx++; }
  }
  return insertIdx;
}
