import queryString from 'query-string';

let currentStorage = null;

export function setCurrent(instance) {
  return currentStorage = instance;
}

export function getCurrent(instance) {
  return currentStorage;
}

class Storage {
  constructor(options) {
    this.options = options;
  }
  name() { return this.name; }
  connect() { }
  list() { }
  get() { }
  put() { }
  remove() { }
}

export class DropboxStorage extends Storage {
  constructor(options) {
    super();
    this.name = 'dropbox';
    this.appKey = 'dyp7393ezuk7uxn';
    this.appSecret = 'ukxhh0s0xx23z9w';
    this.dropboxOAuthURL = 'https://www.dropbox.com/oauth2/authorize';
    this.redirectURI = 'http://localhost:3001/oauth/dropbox';
  }
  connect() {
    window.location = this.dropboxOAuthURL + '?' + queryString.stringify({
      response_type: 'token',
      client_id: this.appKey,
      redirect_uri: this.redirectURI
    });
  }
  _finishConnect() {
    const authData = queryString.parse(window.location.hash.substr(0));
    this.accessToken = authData.access_token;
    this.uid = authData.uid;
    return new Promise((resolve, reject) => resolve(authData));
  }
}
