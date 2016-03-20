function action(type, fn, props) {
  return exports[type] = Object.assign(
    (...args) => ({ type, payload: { ...fn(...args) } }),
    { type },
    props || {}
  );
}

function symbols(...items) {
  const out = {};
  items.forEach(item => out[item] = Symbol(item));
  return out;
}

action('setNodeAttribute', (path, name, value) => ({path, name, value}));

action('insertNode', (node, path, position) => ({node, path, position}));

action('deleteNode', (path) => ({path}));

action('moveNode',
  (fromPath, toPath, position) => ({fromPath, toPath, position}),
  { positions: symbols('BEFORE', 'AFTER', 'ADOPT', 'ADOPT_LAST') }
);
