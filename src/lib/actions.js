import { actions, symbols } from './utils';

module.exports = actions({
  setNodeAttribute: (path, name, value) => ({path, name, value}),
  insertNode: (node, path, position) => ({node, path, position}),
  deleteNode: (path) => ({path}),
  selectNode: (path) => ({path}),
  clearSelection: () => ({}),
  moveNode: [
    (fromPath, toPath, position) => ({fromPath, toPath, position}),
    {positions: symbols('BEFORE', 'AFTER', 'ADOPT', 'ADOPT_LAST')}
  ],
});
