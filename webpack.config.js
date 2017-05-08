var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var DIST_PATH = path.resolve(__dirname, 'dist');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'app.js',
    // sourceMapFilename: "app.js.map",
    path: DIST_PATH
  },
  // devtool: 'cheap-eval-source-map',
  devServer: {
    contentBase: DIST_PATH,
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {test: /\.(js|jsx)$/, use: 'babel-loader'},
      {test: /\.(txt|opml)$/, use: 'raw-loader'},
      {test: /\.css$/, use: ExtractTextPlugin.extract({use: 'css-loader'})}
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new ExtractTextPlugin('app.css'),
  ]
};
