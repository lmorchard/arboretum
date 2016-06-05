import localForage from 'localforage';

const STORAGE_KEY = 'storage';

export function createConnection(name, options) {
  const cls = module.exports[name];
  const instance = new cls(options);
  return instance.init();
}

export function persistConnection(name, options) {
  return localForage.setItem(STORAGE_KEY, {name, options})
    .then(() => createConnection(name, options));
}

export function restoreConnection() {
  return localForage.getItem(STORAGE_KEY)
    .then(d => !d ? null : createConnection(d.name, d.options));
}

export function clearConnection() {
  return localForage.removeItem(STORAGE_KEY);
}

export class Storage {
  static get config() { return {}; }
  static startConnect() { }
  static finishConnect() { }
  get config() { return this.constructor.config; }
  get name() { return this.constructor.config.name; }
  constructor(options) { this.options = options; }
  init() {
    return new Promise((resolve, reject) => resolve(this));
  }
}

export const DropboxStorage = require('./DropboxStorage').default;
