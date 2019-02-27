const path = require('path')
const {
  CheckerPlugin,
  TsConfigPathsPlugin
} = require('awesome-typescript-loader')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  context: resolve('src'),

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss'],
    plugins: [new TsConfigPathsPlugin()]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader', 'source-map-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'awesome-typescript-loader']
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader'
          },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              fiber: require('fibers')
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),

    new MiniCssExtractPlugin({
      // only work in production mode
      filename: '[name].[contenthash:6].css',
      chunkFilename: '[id].css'
    }),

    new HtmlWebpackPlugin({
      template: resolve('public/index.html'),
      inject: true
    })
  ],

  performance: {
    hints: false
  }
}
