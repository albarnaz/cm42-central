// Note: You must restart bin/webpack-dev-server for changes to take effect

/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const path = require('path')
const webpack = require('webpack')
const { basename, dirname, join, relative, resolve } = require('path')
const { sync } = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const extname = require('path-complete-extname')
const { env, settings, output, loadersDir } = require('./configuration.js')

const extensionGlob = `**/*{${settings.extensions.join(',')}}*`
const entryPath = join(settings.source_path, settings.source_entry_path)
const packPaths = sync(join(entryPath, extensionGlob))

module.exports = {

  entry: packPaths.reduce(
    (map, entry) => {
      const localMap = map
      const namespace = relative(join(entryPath), dirname(entry))
      localMap[join(namespace, basename(entry, extname(entry)))] = resolve(entry)
      return localMap
    }, {}
  ),

  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  },

  output: {
    filename: '[name].js',
    path: output.path,
    publicPath: output.publicPath
  },

  module: {
    rules: sync(join(loadersDir, '*.js')).map(loader => require(loader))
  },

  plugins: [
    new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(env))),
    new ExtractTextPlugin(env.NODE_ENV === 'production' ? '[name]-[hash].css' : '[name].css'),
    new ManifestPlugin({
      publicPath: output.publicPath,
      writeToFileEmit: true
    }),

    new webpack.NormalModuleReplacementPlugin(
      /jquery\.ui\.widget/,
      require.resolve('cloudinary_js/js/jquery.ui.widget')
    ),

    new webpack.ProvidePlugin({
      Backbone: 'backbone',
      $: 'jquery',
      jQuery: 'jquery',
      _: 'underscore'
    })
  ],

  resolve: {
    extensions: settings.extensions,
    modules: [
      resolve(entryPath),
      'node_modules'
    ],
    alias: {
      vendor: path.join(__dirname, '../..', 'vendor/assets/javascripts'),
      collections: path.join(__dirname, '../..', 'app/assets/javascripts/collections'),
      mixins: path.join(__dirname, '../..', 'app/assets/javascripts/mixins'),
      models: path.join(__dirname, '../..', 'app/assets/javascripts/models'),
      templates: path.join(__dirname, '../..', 'app/assets/javascripts/templates'),
      views: path.join(__dirname, '../..', 'app/assets/javascripts/views'),
      libs: path.join(__dirname, '../..', 'app/assets/javascripts/libs'),
      components: path.join(__dirname, '../..', 'app/assets/javascripts/components'),
      gritter: 'gritter/js/jquery.gritter.min.js'
    }
  },

  resolveLoader: {
    modules: ['node_modules']
  }
}