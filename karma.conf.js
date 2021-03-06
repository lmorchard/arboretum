module.exports = function(config){
  config.set({
    basePath: '.',

    files : [
      'dist/vendor.js',
      'dist-test/index.js',
      {pattern: 'dist-test/*', watched: true, included: false, served: true},
      {pattern: 'dist/*', watched: true, included: false, served: true}
    ],

    autoWatch : true,

    autoWatchBatchDelay: 1000, // Try not to race with gulp build

    frameworks: ['mocha', 'chai'],

    browsers : ['Firefox'],
    // browsers : ['Firefox', 'Chrome'],

    reporters: ['spec'],

    plugins : [
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-spec-reporter'
    ],
  });
};
