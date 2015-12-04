export const MOVE_NODE = 'MOVE_NODE';
export const INSERT_NODE = 'INSERT_NODE';
export const DELETE_NODE = 'DELETE_NODE';
export const SET_NODE_ATTRIBUTE = 'SET_NODE_ATTRIBUTE';

export const MovePositions = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  ADOPT: 'ADOPT'
};

export function setNodeAttribute(path, name, value) {
  return { type: SET_NODE_ATTRIBUTE, path, name, value };
}

export function insertNode(node, path, position) {
  return { type: INSERT_NODE, node, path, position };
}

export function deleteNode(path) {
  return { type: DELETE_NODE, path };
}

export function moveNode(fromPath, toPath, position) {
  return { type: MOVE_NODE, fromPath, toPath, position };
}
