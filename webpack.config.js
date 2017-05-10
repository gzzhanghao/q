const path = require('path')

module.exports = {

  entry: {
    main: './src',
  },

  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    publicPath: '/dist/',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [/node_modules/],
        options: {
          compilerOptions: {
            declaration: false,
            target: 'es5',
            module: 'commonjs',
          },
          transpileOnly: true,
        },
      },
      {
        test: /\.svg$/,
        loader: 'html-loader',
        exclude: [/node_modules/],
        options: {
          minimize: true,
        },
      }
    ],
  },

  devtool: 'source-map',

  resolve: {
    alias: {
      'parchment': path.resolve('externals/parchment/src/parchment.ts'),
      'quill$': path.resolve('externals/quill/quill.js'),
      'quill-delta': path.resolve('externals/delta'),
    },
    extensions: ['.js', '.ts', '.svg'],
  },
}
