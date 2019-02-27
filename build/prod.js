const merge = require('webpack-merge')
const baseWebpackConfig = require('./base')
const webpack = require('webpack')

const productionConfig = merge(baseWebpackConfig, {
  mode: 'production',

  entry: './index.tsx',

  output: {
    filename: '[name].[contenthash:6].js'
  },  

  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: true
    })
  ],

  devtool: 'source-map'
})

module.exports = productionConfig




