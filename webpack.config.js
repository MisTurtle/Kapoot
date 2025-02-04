import { rootPath } from "./src/commons/utils.js";

export default {
    entry: './src/client/index.js',
    output: {
        filename: 'bundle.js',
        path: rootPath("src/static")
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
};