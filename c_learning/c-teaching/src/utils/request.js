import axios from 'axios'
import router from '@/router/index.js'
import { ElMessage } from 'element-plus'

const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8101`
  }

  return 'http://localhost:8101'
}

const service = axios.create({
  baseURL: getApiBase(),
  timeout: 60000,
})

// 请求拦截器
service.interceptors.request.use(config => {
  // 添加 token 等逻辑
  config.headers['token'] = localStorage.getItem('token')
  if (config.method === 'put' || config.method === 'post') {
    for (let key in config.data) {
      if (
        config.data[key] === undefined ||
        config.data[key] === '' ||
        config.data[key] === null
      ) {
        delete config.data[key]
      }
    }
  }
  if (config.method === 'put') {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    switch (response.data?.code) {
      case 40100:
        ElMessage.error(response.data.message)
        router.push('/login')
        return Promise.reject(response.data.message)
      case 50000:
      case 50001:
        ElMessage.error(response.data.message)
        return Promise.reject(response.data)
      case 40000:
        ElMessage.error(response.data.message)
        return Promise.reject(response.data.message)
      case 0:
      case 200:
        return Promise.resolve(response.data)
      default:
        return Promise.resolve(response.data)
    }
  },
  error => {
    return Promise.reject(error)
  },
)
export default service
