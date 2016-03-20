import { actions, symbols } from './utils';

module.exports = actions({
  setNodeAttribute: (path, name, value) => ({path, name, value}),
  insertNode: (node, path, position) => ({node, path, position}),
  deleteNode: (path) => ({path}),
  moveNode: [
    (fromPath, toPath, position) => ({fromPath, toPath, position}),
    {positions: symbols('BEFORE', 'AFTER', 'ADOPT', 'ADOPT_LAST')}
  ],
});

module.exports.moveNodeDelayed = (fromPath, toPath, position) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(module.exports.moveNode(fromPath, toPath, position))
    }, 1000);
  });
}
