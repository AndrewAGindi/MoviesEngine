const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "static/js"),
        filename: "app.js"
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        babelrc: true
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            ["~"]: path.resolve(__dirname, "src")
        }
    }
};
