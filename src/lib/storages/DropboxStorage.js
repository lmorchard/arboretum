import {Storage, clearConnection, persistConnection} from './index';
import queryString from 'query-string';

export default class DropboxStorage extends Storage {
  static get config() {
    return {
      name: 'DropboxStorage',
      appKey: 'dyp7393ezuk7uxn',
      appSecret: 'ukxhh0s0xx23z9w',
      dropboxOAuthURL: 'https://www.dropbox.com/oauth2/authorize',
      apiBase: 'https://api.dropboxapi.com/2/',
      contentBase: 'https://content.dropboxapi.com/2/',
      redirectURI: 'http://localhost:3001/oauth/dropbox',
    };
  }

  static startConnect() {
    const {dropboxOAuthURL, appKey, redirectURI} = this.config;
    window.location = dropboxOAuthURL + '?' + queryString.stringify({
      response_type: 'token',
      client_id: appKey,
      redirect_uri: redirectURI
    });
  }

  static finishConnect() {
    const {name} = this.config;
    const authData = queryString.parse(window.location.hash.substr(0));
    return persistConnection(name, {
      uid: authData.uid,
      accessToken: authData.access_token
    });
  }

  init() {
    const {apiBase} = this.config;
    const {accessToken} = this.options;

    return Promise.all([
      this.list(),
      this.account()
    ]).then(results => {
      const [filelist, account] = results;
      this.filelist = filelist;
      this.account = account;
      return this;
    });
  }

  disconnect() {
    const {apiBase} = this.config;
    const {accessToken} = this.options;

    return fetch(apiBase + 'auth/token/revoke', {
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + accessToken},
      mode: 'cors'
    }).then(response => clearConnection());
  }

  account() {
    const {apiBase} = this.config;
    const {accessToken} = this.options;

    return fetch(apiBase + 'users/get_current_account', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      mode: 'cors'
    }).then(response => response.json());
  }

  list() {
    const {apiBase} = this.config;
    const {accessToken} = this.options;

    return fetch(apiBase + 'files/list_folder', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      body: JSON.stringify({
        path: '',
        recursive: true
      }),
      mode: 'cors'
    }).then(response => response.json()).then(data => {
      return data.entries
        .filter(entry => entry['.tag'] === 'file')
        .map(entry => entry.path_display.substr(1));
    });
  }

  get(path) {
    const {contentBase} = this.config;
    const {accessToken} = this.options;

    return fetch(contentBase + 'files/download', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Dropbox-API-Arg': JSON.stringify({
          path: '/' + path
        })
      },
      mode: 'cors'
    }).then(response => response.text());
  }

  put(path, data) {
    const {contentBase} = this.config;
    const {accessToken} = this.options;

    return fetch(contentBase + 'files/upload', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/octet-stream',
        'Authorization': 'Bearer ' + accessToken,
        'Dropbox-API-Arg': JSON.stringify({
          path: '/' + path,
          mode: 'overwrite', // update (needs rev)
          // autorename: true,
          mute: false
        })
      },
      body: data,
      mode: 'cors'
    }).then(response => response.text());
  }
}
