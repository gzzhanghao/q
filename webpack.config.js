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
        include: [
          path.resolve('src'),
        ],
        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
        },
      },
    ],
  },

  devtool: 'source-map',
}
