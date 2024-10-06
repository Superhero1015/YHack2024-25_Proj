const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js', // Entry point of your React code
    output: {
      path: path.resolve(__dirname, 'dist'), // Output directory (served statically)
      filename: 'bundle.js', // Output file name
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/, // Include both .js and .jsx files
          exclude: /node_modules/, // Ignore node_modules
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'], // Transpile modern JS/JSX
              cacheDirectory: false, // Enable caching for faster rebuilds
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'], // Allow imports without specifying .js or .jsx extensions
      modules: ['src', 'node_modules'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html', // Use this HTML template
        filename: 'index.html',
      }),
    ],
    devServer: {
      static: path.join(__dirname, 'public'),
      port: 8080, // You can change the port
    },
  };
  
  console.log("Webpack is loading JSX with Babel");