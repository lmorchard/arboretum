import { actions, symbols } from './utils';

module.exports = actions({
  loadNodes: (data) => ({data}),
  setNodeAttribute: (path, name, value) => ({path, name, value}),
  setCollapsed: (path, value, recursive) => ({path, value, recursive}),
  deleteNode: (path) => ({path}),
  insertNode: [
    (node, path, position) => ({node, path, position}),
    {positions: symbols('BEFORE', 'AFTER', 'ADOPT', 'ADOPT_LAST')}
  ],
  moveNode: (fromPath, toPath, position) => ({fromPath, toPath, position}),
  setFilename: (filename) => ({filename}),
  selectNode: (path) => ({path}),
  clearSelection: () => ({}),
  setStorage: (storage) => ({storage}),
  clearStorage: () => ({})
});
