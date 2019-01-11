var webpack = require('webpack');

module.exports = {
  entry: './js/script.js',
  mode: 'none',
  output: {
    filename: './public/bundle.js',
    path: __dirname,
  },
  optimization: {
    minimize: true
  },
  watch: true
}
