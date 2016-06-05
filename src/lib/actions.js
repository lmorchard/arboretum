import { actions, symbols } from './utils';

module.exports = actions({
  setNodeAttribute: (path, name, value) => ({path, name, value}),
  setCollapsed: (path, value, recursive) => ({path, value, recursive}),
  deleteNode: (path) => ({path}),
  selectNode: (path) => ({path}),
  clearSelection: () => ({}),
  insertNode: [
    (node, path, position) => ({node, path, position}),
    {positions: symbols('BEFORE', 'AFTER', 'ADOPT', 'ADOPT_LAST')}
  ],
  moveNode: (fromPath, toPath, position) => ({fromPath, toPath, position}),
  setStorage: (storage) => ({storage}),
  clearStorage: () => ({})
});
