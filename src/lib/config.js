import merge from 'lodash.merge';

const defaultConfig = {
  'storage': {
    'dropbox': {
      appKey: 'dyp7393ezuk7uxn',
      appSecret: 'ukxhh0s0xx23z9w'
    }
  }
};

const perHostnameConfigs = {
  'localhost': {
    'basePath': '/',
    'storage': {
      'dropbox': {
        redirectURI: 'http://localhost:3001/oauth/dropbox'
      }
    }
  },
  'lmorchard.github.io': {
    'basePath': '/arboretum/',
    'storage': {
      'dropbox': {
        redirectURI: 'https://lmorchard.github.io/arboretum/oauth/dropbox'
      }
    }
  }
};

export default merge(
  defaultConfig,
  perHostnameConfigs[window.location.hostname] || {}
);
