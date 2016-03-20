export function actions(actionmap) {
  const out = {};
  Object.keys(actionmap).forEach(type => {
    const item = actionmap[type];
    let fn, props;
    if (Array.isArray(item)) {
      [fn, props] = item;
    } else {
      fn = item;
    }
    out[type] = Object.assign(
      (...args) => ({ type, payload: { ...fn(...args) } }),
      { type },
      props || {}
    );
  });
  return out;
}

export function symbols(...items) {
  const out = {};
  items.forEach(item => out[item] = Symbol(item));
  return out;
}

export function splitPath (path) {
  return path.split('.');
}

export function getNodeContext (state, path) {
  var key = splitPath(path);
  return { key,
    parentKey: key.slice(0, -2),
    index: parseInt(key[key.length - 1], 10),
    value: state.getIn(key),
    siblings: state.getIn(key.slice(0, -1))
  }
}

export function getPreviousSiblingPath (state, path) {
  var key = splitPath(path);
  var index = parseInt(key.pop(), 10);

  return (index - 1 < 0) ? null :
    key.concat([index - 1]).join('.');
}

export function getNextSiblingPath (state, path) {
  var key = splitPath(path);
  var index = parseInt(key.pop(), 10);
  var siblings = key.length == 0 ? state : state.getIn(key);

  return (index + 1 >= siblings.size) ? null :
    key.concat([index + 1]).join('.');
}

export function getPreviousNodePath (state, path) {
  var key = splitPath(path);
  var index = parseInt(key.pop(), 10);
  var siblings = key.length == 0 ? state : state.getIn(key);

  // Pop up to the parent if past the first sibling.
  if (index - 1 < 0) {
    return (key.length == 0) ? null :
      key.slice(0, -1).join('.');
  }

  // Step into previous sibling, or the deepest last child.
  var step = key.concat([index - 1]);
  while (state.hasIn(step.concat(['children']))) {
    var children = state.getIn(step.concat(['children']));
    step = step.concat(['children', String(children.size - 1)]);
  }

  return step.join('.');
}

export function getNextNodePath (state, path) {
  var key = splitPath(path);

  // Walk down into children
  if (state.hasIn(key.concat(['children']))) {
    return key.join('.') + '.children.0';
  }

  // Walk forward through siblings
  var index = parseInt(key.pop(), 10);
  var siblings = key.length == 0 ? state : state.getIn(key);
  if (index + 1 < siblings.size) {
    return key.concat([index + 1]).join('.');
  }

  // Walk up into parent's siblings
  while (key.length) {
    var _ = key.pop(); // 'children'
    var parentIndex = parseInt(key.pop(), 10);
    var parentSiblings = state.getIn(key);
    if (parentIndex + 1 < parentSiblings.size) {
      return key.concat([parentIndex + 1]).join('.');
    }
  }

  return null;
}
