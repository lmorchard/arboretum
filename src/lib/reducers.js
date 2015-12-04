import { combineReducers } from 'redux';
import Immutable from 'immutable';

import * as actions from './actions';

function nodes(state=[], action) {
  switch (action.type) {

    case actions.INSERT_NODE:
      return state;

    case actions.DELETE_NODE:
      // TODO: Need to prune empty children lists from parents?
      return state.deleteIn(action.path.split('.'));

    case actions.MOVE_NODE:
      const position = action.position;
      const fromPath = action.fromPath.split('.');
      const toPath = action.toPath.split('.');

      // Grab the node from the tree.
      const node = state.getIn(fromPath);

      // HACK: Set the node null to mark for deletion. Doing this because I'm
      // too lazy to recalculate toPath to compensate for the missing node.
      // Might discover this is regrettably expensive, later.
      state = state.setIn(fromPath, null);

      // Insert the node into the new position...
      if (position == actions.MovePositions.ADOPT) {
        // Adopt the node into parent, creating the child list if necessary.
        state = state.updateIn(toPath, parent => parent.has('children') ?
            parent.update('children', children => children.unshift(node)) :
            parent.set('children', Immutable.List([node])));
      } else {
        // Insert node before or after toPath, depending on action position
        const index = parseInt(toPath.pop()) +
                      (position == actions.MovePositions.BEFORE) ? 0 : 1;
        state = state.updateIn(toPath, nodes => nodes.splice(index, 0, node));
      }

      // Remove any nodes marked to be deleted.
      return state.update(omitNullNodes);

    case actions.CHANGE_NODE_TITLE:
      return state;

    default:
      return state;

  }
}

const omitNullNodes = (children) =>
    children.filter(node => node !== null)
            .map(node => !node.has('children') ?
                         node : node.update('children', omitNullNodes));

export default combineReducers({
  nodes
});
