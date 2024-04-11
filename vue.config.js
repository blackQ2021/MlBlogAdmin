const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    // 跳过检查host
    // disableHostCheck: true 被遗弃了
    historyApiFallback: true,
    allowedHosts: "all",
    proxy: {
      '/user': {
        target: 'http://localhost:2022',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://localhost:2022',
        changeOrigin: true
      },
      '/portal': {
        target: 'http://localhost:2022',
        changeOrigin: true
      } 
    }
  }
})
