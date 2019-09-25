import path from "path";
import webpack from "webpack";

export default (_env, argv) => ({
  devtool: 'source-map',
  entry: {
    home: ["./app/js/home"],
    blog: ["./app/js/blog"]
  },
  output: {
    path: path.resolve(__dirname, "public", "js"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODECRAFT_BACKEND: 'https://nodecraft.cloud.zihao.me',
      NODE_ENV: argv.mode
    })
  ]
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all'
  //       }
  //     }
  //   }
  // }
});
