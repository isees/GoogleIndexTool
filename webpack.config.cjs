const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";
  console.log("Webpack mode:", argv.mode);
  console.log("isDevelopment:", isDevelopment);

  return {
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "source-map" : false,
    entry: {
      popup: ["./src/pages/popup/index.tsx", "./src/styles/globals.css"],
      background: "./src/background/index.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        vm: require.resolve("vm-browserify"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  sourceMap: isDevelopment,
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
          include: path.resolve(__dirname, "src"),
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      new CopyPlugin({
        patterns: [{ from: "public", to: "" }],
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/popup/index.html",
        filename: "popup.html",
        chunks: ["popup"],
      }),
      new ForkTsCheckerWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: "styles/[name].[contenthash].css",
      }),
    ],
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: !isDevelopment,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace("@", "")}`;
            },
          },
        },
      },
    },
    performance: {
      hints: "warning",
      maxEntrypointSize: 244000,
      maxAssetSize: 244000,
    },
  };
};
