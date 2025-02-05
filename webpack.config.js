const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const production = argv.mode === 'production';

  return {
    mode: production ? 'production' : 'development',
    devtool: production ? 'hidden-source-map' : 'eval',
    entry: { main: './src/index.tsx' },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
    },
    devServer: {
      port: 3000, // 클라이언트가 실행 중인 포트
      host: '0.0.0.0', // 로컬 개발 서버
      allowedHosts: 'all', // 모든 호스트에서 접근 가능
      client: {
        webSocketURL: {
            protocol: 'ws',
            hostname: '0.0.0.0',
            port: 3000,
            pathname: '/ws',
        },
    },
      proxy: [
        {
          context: ['/websocket'],
          target: 'wss://api.upbit.com',
          ws: true,
          secure: false,
          changeOrigin: true,
          logLevel: 'debug',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],// 파일 확장자 처리
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "stream": require.resolve("stream-browserify"),
        "vm": require.resolve("vm-browserify"),
        "process": require.resolve("process/browser")
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ['babel-loader', 'ts-loader'], // Babel과 TypeScript 로더
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'], // CSS 로더
        },
        {
          test: /\.scss$/, // SCSS 로더
          use: ['style-loader', 'css-loader', 'sass-loader'], // SCSS 스타일 로더
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        React: 'react', // React 자동 import
        Buffer: ["buffer", "Buffer"],
        process: "process/browser"
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html', // HTML 템플릿 경로
        minify: production
          ? {
              collapseWhitespace: true, // production mode 시, 빈칸 제거
              removeComments: true, // production mode 시, 주석 제거
            }
          : false,
      }),
      new CleanWebpackPlugin(), // 이전 빌드 결과 삭제
    ],
  };
};
