const webpack = require("webpack");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  const production = argv.mode === "production";

  return {
    mode: production ? "production" : "development",
    devtool: production ? "hidden-source-map" : "eval",
    entry: { main: "./src/index.tsx" },
    output: {
      path: path.join(__dirname, "/dist"),
      filename: "[name].js",
    },
    devServer: {
      port: 3000, // port 번호 설정 가능
      hot: true, // HMR 활성화 여부, 모듈 단위로 업데이트 적용
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"], // ts를 사용할 경우 ts 추가
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ["babel-loader", "ts-loader"],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.scss$/, // scss 로더 필요
          use: ["style-loader", "css-loader", "sass-loader"],
        }
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        React: "react",
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        minify: // 압축 옵션
          process.env.NODE_ENV === "production"
            ? {
                collapseWhitespace: true, // production mode 시, 빈칸 제거
                removeComments: true, // production mode 시, 주석 제거
              }
            : false,
      }),
      new CleanWebpackPlugin(),
    ],
  };
};