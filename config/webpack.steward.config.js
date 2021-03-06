const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const conf = require('./utils')

const isDevMode = process.env.NODE_ENV === 'development'
const config = {
  devtool: isDevMode ? 'eval-source-map' : false,
  mode: process.env.NODE_ENV,
  entry: conf.entries,
  output: {
    path: path.resolve(__dirname, '../output/steward/'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js' ],
    alias: {
      '@': path.resolve(__dirname, '../extension/'),
      vue: 'vue/dist/vue.js',
      enum: path.resolve(__dirname, '../extension/enum'),
      constant: path.resolve(__dirname, '../extension/constant'),
      common: path.resolve(__dirname, '../extension/common'),
      utils: path.resolve(__dirname, '../extension/utils'),
      service: path.resolve(__dirname, '../extension/service'),
      conf: path.resolve(__dirname, '../extension/conf'),
      helper: path.resolve(__dirname, '../extension/helper'),
      collection: path.resolve(__dirname, '../extension/collection'),
      info: path.resolve(__dirname, '../extension/info'),
      plugins: path.resolve(__dirname, '../extension/plugins'),
      main: path.resolve(__dirname, '../extension/main'),
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: !isDevMode,
        },
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        test: /\.css$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.scss$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.sass$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            // eslint-disable-next-line
            options: { implementation: require('sass') },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader?name=[name].[ext]&outputPath=./&publicPath=./'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
          esModule: false,
        },
      },
    ]
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      minChunks: 3,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendor: {
          name: 'vendor',
          priority: -10,
          reuseExistingChunk: true,
          test: /\/node_modules\//
        },
        common: {
          name: 'common',
          priority: 0,
          reuseExistingChunk: true,
          test: /\/extension\/(collection|common|conf|constant|enum|helper|info|lib|main|plugins|server|service|utils)\//
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new webpack.DefinePlugin({
      EXT_TYPE: JSON.stringify("steward"),
      PLATFORM: JSON.stringify("chrome")
    }),
    new VueLoaderPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    //Generate an HTML5 file that includes all webpack bundles(includes css & js) in the body using script tags
    ...conf.pages,
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyWebpackPlugin({patterns: [
      {from: 'extension/img', to: 'img'},
      {from: 'extension/svg', to: 'iconfont'},
      {from: 'extension/css', to: 'css'},
      {from: 'extension/scripts', to: 'scripts'},
      {from: 'extension/_locales', to: '_locales'},
      {from: 'extension/manifest.json', to: 'manifest.json'}
    ]}),
  ]
}

if (!isDevMode) {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].css',
    })
  )
}

module.exports = config
