const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bot-daddy.js',
    path: path.resolve(__dirname, '../public'),
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
};
