'use strict';
const path = require('path');

module.exports = (env, {mode}) => ({
  entry: {
    'render-session': ['index.ts'],
  },

  context: path.join(process.cwd(), 'src'),

  output: {
    publicPath: mode === 'production' ? '/' : 'http://localhost:8080/',
    path: path.join(process.cwd(), 'dist'),
    filename: `index${mode === 'production' ? '.min.' : '.'}js`,
  },

  mode,

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        enforce: 'pre',
        test: /\.ts$/,
        loader: 'tslint-loader',
      }
    ],
  },

  resolve: {
    modules: ['node_modules', path.resolve(process.cwd(), 'src')],
    extensions: ['.ts', '.js'],
  },

  devServer: {
    contentBase: './dist',
    clientLogLevel: 'info',
    port: 8080,
    inline: true,
    historyApiFallback: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 500,
    },
  },

  devtool: mode === "production" ? undefined: 'inline-source-map',
});
