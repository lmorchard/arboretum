export const MOVE_NODE = 'MOVE_NODE';
export const INSERT_NODE = 'INSERT_NODE';
export const DELETE_NODE = 'DELETE_NODE';
export const CHANGE_NODE_TITLE = 'CHANGE_NODE_TITLE';

export const MovePositions = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  ADOPT: 'ADOPT'
};

export function insertNode(node, path, before) {
  return { type: INSERT_NODE, node, path, before };
}

export function deleteNode(path) {
  return { type: DELETE_NODE, path };
}

export function moveNode(fromPath, toPath, position) {
  return { type: MOVE_NODE, fromPath, toPath, position };
}
