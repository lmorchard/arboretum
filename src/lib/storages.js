import queryString from 'query-string';
window.queryString = queryString;

class Storage {
  constructor(options) {
    this.options = options;
  }
  connect() {
  }
  list() {
  }
  get() {
  }
  put() {
  }
  remove() {
  }
}

function toQueryString(obj) {
  var parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
    }
  }
  return parts.join("&");
}

export class DropboxStorage extends Storage {
  constructor(options) {
    super();
    this.appKey = 'dyp7393ezuk7uxn';
    this.appSecret = 'ukxhh0s0xx23z9w';
    this.dropboxOAuthURL = 'https://www.dropbox.com/oauth2/authorize';
    this.redirectURI = 'http://localhost:3001/oauth/dropbox';
  }
  connect() {
    const params = {
      response_type: 'token',
      client_id: this.appKey,
      redirect_uri: this.redirectURI
    };
    const authURL = this.dropboxOAuthURL + '?' + queryString.stringify(params);
    window.location = authURL;
  }

}
