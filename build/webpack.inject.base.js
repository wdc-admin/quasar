const
  path = require('path'),
  VueLoaderPlugin = require('vue-loader/lib/plugin'),
  FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'),
  WebpackBar = require('webpackbar')

const
  env = require('./env'),
  projectRoot = path.resolve(__dirname, '../')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = function (chain) {
  chain.mode('development')
  chain.devtool('#cheap-module-eval-source-map')

  chain.resolve.extensions
    .merge([`.${env.theme}.js`, '.js', `.${env.theme}.vue`, '.vue'])

  chain.resolve.modules
    .merge([
      resolve('src'),
      'node_modules'
    ])

  chain.resolve.alias
    .merge({
      quasar: resolve(`src/index.esm`),
      'quasar-css': resolve(`src/css/${env.theme}.styl`),
      assets: resolve('dev/assets'),
      components: resolve('dev/components'),
      data: resolve('dev/data'),
      variables: resolve(`src/css/core.variables.styl`)
    })

  chain.module.rule('lint')
    .test(/\.(js|vue)$/)
    .enforce('pre')
    .exclude
      .add(/node_modules/)
      .end()
    .use('eslint-loader')
      .loader('eslint-loader')

  chain.module.rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
      .loader('vue-loader')
      .options({
        productionMode: false,
        compilerOptions: {
          preserveWhitespace: false
        },
        transformAssetUrls: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      })

  chain.module.rule('babel')
    .test(/\.js$/)
    .include
      .add(projectRoot)
      .end()
    .exclude
      .add(/node_modules/)
      .end()
    .use('babel-loader')
      .loader('babel-loader')

  chain.module.rule('images')
    .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
    .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000,
        name: 'img/[name].[hash:7].[ext]'
      })

  chain.module.rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
    .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000,
        name: 'fonts/[name].[hash:7].[ext]'
      })

  injectStyleRules(chain)

  chain.plugin('vue-loader')
    .use(VueLoaderPlugin)

  chain.performance
    .hints(false)
    .maxAssetSize(1000000)

  chain.node
    .merge({
      // prevent webpack from injecting useless setImmediate polyfill because Vue
      // source contains it (although only uses it if it's native).
      setImmediate: false,
      // process is injected via DefinePlugin, although some 3rd party
      // libraries may require a mock to work properly (#934)
      process: 'mock',
      // prevent webpack from injecting mocks to Node native modules
      // that does not make sense for the client
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    })

  chain.optimization
    .noEmitOnErrors(true)

  chain.plugin('webpack-bar')
    .use(WebpackBar)

  chain.plugin('friendly-errors')
    .use(FriendlyErrorsPlugin, [{
      clearConsole: true
    }])
}

function injectRule (chain, lang, test, loader, options) {
  const rule = chain.module.rule(lang).test(test)

  rule.use('vue-style-loader')
    .loader('vue-style-loader')
    .options({
      sourceMap: true
    })

  rule.use('css-loader')
    .loader('css-loader')
    .options({
      importLoaders: 2 + (loader ? 1 : 0),
      sourceMap: true
    })

  const postCssOpts = {
    sourceMap: true
  }

  if (env.rtl) {
    const rtlOptions = env.rtl === true
      ? {}
      : env.rtl

    postCssOpts.plugins = () => {
      return [
        require('postcss-rtl')(rtlOptions)
      ]
    }
  }

  rule.use('postcss-loader')
    .loader('postcss-loader')
    .options(postCssOpts)

  if (loader) {
    rule.use(loader)
      .loader(loader)
      .options(Object.assign(
        { sourceMap: true },
        options
      ))
  }
}

function injectStyleRules (chain, options) {
  injectRule(chain, 'css', /\.css$/)
  injectRule(chain, 'stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack'
  })
}
