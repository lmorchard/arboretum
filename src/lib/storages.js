import queryString from 'query-string';

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
    this.apiBase = 'https://api.dropboxapi.com/2/';
    this.contentBase = 'https://content.dropboxapi.com/2/';
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
    console.log('auth', authData.access_token);
    this.uid = authData.uid;
    return new Promise((resolve, reject) => resolve(authData));
  }

  list() {
    return fetch(this.apiBase + 'files/list_folder', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.accessToken
      },
      body: JSON.stringify({
        path: '',
        recursive: true
      }),
      mode: 'cors'
    }).then(response => response.json()).then(data => {
      return data.entries.map(entry => entry.path_display);
    });
  }

  get(path) {
    return fetch(this.contentBase + 'files/download', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.accessToken,
        'Dropbox-API-Arg': JSON.stringify({
          path: '/' + path
        })
      },
      mode: 'cors'
    }).then(response => response.text());
  }

  put(path, data) {
    return fetch(this.contentBase + 'files/upload', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/octet-stream',
        'Authorization': 'Bearer ' + this.accessToken,
        'Dropbox-API-Arg': JSON.stringify({
          path: '/' + path,
          mode: 'overwrite', // update (needs rev)
          // autorename: true,
          mute: false
        })
      },
      body: data,
      mode: 'cors'
    }).catch(result => console.log('DERP', result)).then(response => {
      console.log(response);
      return response.text()
    });
  }

}
