module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        assets: '@/assets',
        components: '@/components',
        views: '@/views',
        plugins: '@/plugins'
      }
    }
  },
  devServer: {
    host: 'localhost',
    port: 8080,
    open: true
  }
}
