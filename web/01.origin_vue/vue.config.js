const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
    outputDir: "./dist",
    chainWebpack: config => {
        config.resolve.alias
          .set("@", resolve("src"))
      },    
    devServer: {
        //proxy:'http://localhost:2222'
        proxy: {
            '/api': {
                ws: false,
                changeOrigin: true,
                target: 'http://127.0.0.1:9527'
            },

            '/ws': {
                target: 'ws://127.0.0.1:2222',
                ws: true,
                changeOrigin: true
            },

        }
    }
};