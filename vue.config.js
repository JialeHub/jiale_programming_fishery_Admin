const settings = require("./src/settings");

module.exports = {
  assetsDir: 'assets',
  "transpileDependencies": [
    "vuetify"
  ],
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "~@/styles/variables.scss"'
      },
      scss: {
        additionalData: '@import "~@/styles/variables.scss";'
      }
    }
  },
  pages: {
    index: {
      entry: './src/main.js',
      title: settings.title
    }
  },
  devServer: {
    "disableHostCheck": true,
    "https" : true,
    "port" : 803,
    proxy: {
      '/devApi/': {
        target: 'https://luojiale.com:9802/',
        changeOrigin: true,
        pathRewrite: {
          '^/devApi/': ''
        }
      },
      '/prodApi/': {
        //target: 'http://121.196.153.82:8080/',
		target: 'https://luojiale.com:9802/',
        changeOrigin: true,
        pathRewrite: {
          '^/prodApi/': ''
        }
      }
    }
  },
  productionSourceMap: false,
}
