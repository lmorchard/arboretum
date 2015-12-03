import { combineReducers } from 'redux';
import Immutable from 'immutable';

import * as actions from './actions';

function nodes(state=[], action) {
  switch (action.type) {

    case actions.DELETE_NODE:
      return state.deleteIn(action.path.split('.'));

    case actions.MOVE_NODE:
      const position = action.position;
      const fromPath = action.fromPath.split('.');
      const toPath = action.toPath.split('.');

      // Grab the node from the tree.
      const node = state.getIn(fromPath);

      // Mark the node in-place as in need of deletion.
      // HACK: Doing this so that paths aren't disturbed before copy, worried
      // this might be wasteful since the whole tree gets filtered for garbage
      // collection later.
      state = state.setIn(fromPath, null);

      // Copy the new into the desired position...
      if (position == actions.MovePositions.ADOPT) {
        // Insert node as the first child of toPath
        state = state.updateIn(toPath, parent => parent.has('children') ?
            parent.update('children', children => children.unshift(node)) :
            parent.set('children', Immutable.List([node])));
      } else {
        // Insert node before or after toPath, depending on action position
        const toSiblingsPath = toPath.slice(0, -1);
        const toIndex = parseInt(toPath[toPath.length - 1]);
        const destAdjust = (position == actions.MovePositions.BEFORE) ? 0 : 1;
        state = state.updateIn(toSiblingsPath,
            siblings => siblings.splice(toIndex + destAdjust, 0, node));
      }

      // Remove any nodes marked to be deleted.
      return state.update(removeDeletedNodes);

    case actions.INSERT_NODE:
      return state;

    case actions.CHANGE_NODE_TITLE:
      return state;

    default:
      return state;

  }
}

const removeDeletedNodes = (children) => !children ? Immutable.fromJS([]) :
    children.filter(node => node !== null)
            .map((node) => node.update('children', removeDeletedNodes));

export default combineReducers({
  nodes
});
