import Vue from 'vue'
import App from './App'
import router from './router'
import './plugins/element.js'
import axios from 'axios'

import VueQuillEditor from 'vue-quill-editor'

import moment from 'moment'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

// 创建全局过滤器
Vue.filter('dateFormat', value => {
  const time = value * 1000
  return moment(time).format('YYYY-MM-DD H:mm:ss')
})

// 全局配置baseURL
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
// axios.defaults.baseURL = 'http://106.12.11.162:8888/api/private/v1/'

// 配置请求拦截器
axios.interceptors.request.use(config => {
  // 获取本地token
  const token = window.sessionStorage.getItem('token')
  config.headers.Authorization = token
  return config
})

// 将axios进行全局注册
Vue.prototype.$axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
