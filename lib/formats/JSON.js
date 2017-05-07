import Immutable from 'immutable';

export function parse(input) {
  return Immutable.fromJS(JSON.parse(input));
}

export function serialize(store) {
  return JSON.stringify(store.toJS(), null, ' ');
}
