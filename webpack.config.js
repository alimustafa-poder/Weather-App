const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    devtool: "inline-source-map",
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [new HTMLWebpackPlugin({ 
        template: "./src/index.html",
        favicon: "./src/weatherAppIcon.png"
 })],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:{
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|svg|jpg|gif|jpe?g)$/,
                type: "asset/resource",
              }
        ]
    }
}