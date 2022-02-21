/* === dont forget to import scss to main.js file === */
/* ===> import './main.scss'; <=== */

const path = require('path');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const stringReplaceLoaderOptions = require('./webpack/string-replace-loader-options');

const PUBLIC_DIR = path.join('public');
const DIST_DIR = path.resolve(__dirname, PUBLIC_DIR);
const CSS_DIR = 'css';

module.exports = (env, argv) => {
  let webpackConfig;
  const isDevelopment = (env && env.build) === 'dev';

  const htmlPlugin = new HtmlWebPackPlugin({
    template: './src/index.html',
    filename: './index.html'
  });
  const miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: isDevelopment ? '[name].css' : '[name].[hash].css',
    chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css',
    publicPath: `./${CSS_DIR}`,
  });
  const cleanWebpackPlugin = new CleanWebpackPlugin({
    protectWebpackAssets: false,
    cleanOnceBeforeBuildPatterns: [
      '**/*', // Include recursively
      '!*translations*', // ignore the translations folder
      '!**/*.json' // ignore nested JSON files (static translation assets)
    ]
  });

  webpackConfig = {
    optimization: {
      minimize: !isDevelopment,
    },
    entry: './src/main.js',
    output: {
      path: DIST_DIR,
      filename: 'bundle.js'
    },
    devtool: isDevelopment ? 'source-map' : false,
    devServer: {
      contentBase: DIST_DIR,
      historyApiFallback: true,
      hot: true,
      open: true,
      host: '0.0.0.0',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.s?css$/,
          use: [
            {
              loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, // creates style nodes from JS strings
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
              options: { importLoaders: 2 }, // tell if that you are running your styles through two other loaders before this one should run
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader' // compiles Sass to CSS
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 8192, // 2^13
          },
        },
        {
          test: /\.css$/,
          loader: 'string-replace-loader',
          include: [ /node_modules\/@qualtrics/ ],
          options: stringReplaceLoaderOptions,
        }
      ]
    },
    resolve: {
      alias: {
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        '@qualtrics/ui-react': path.resolve(__dirname, './node_modules/@qualtrics/ui-react'),
      }
    },
    plugins: [
      htmlPlugin,
      miniCssExtractPlugin,
      cleanWebpackPlugin
    ]
  };
  return webpackConfig;
};
