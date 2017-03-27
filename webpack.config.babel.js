import webpack from "webpack";
import path from "path";

export default {
  context: path.resolve(__dirname, "app"),
  entry: {
    home: ["./js/home"],
    blog: ["./js/blog"]
  },
  output: {
    path: path.resolve(__dirname, "public", "js"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /(node_modules)/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve('./app'),
      path.resolve('./node_modules')
    ]
  },
};
