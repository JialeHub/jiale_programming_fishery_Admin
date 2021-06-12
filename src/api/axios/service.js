import axios from 'axios'
import store from '@/store'
import settings from '@/settings'
import {notEmpty} from "@/utils/globalMethod";
import {logout} from "@/utils/auth";

const service = axios.create({
  timeout: settings.timeout,
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true
})

// 请求拦截
service.interceptors.request.use(
  config => {
    const token = store.getters.token
    const url = config.url
    if (!notAddToken(url) && notEmpty(store.getters.token)) config.headers.Authorization = token
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error.response)
  }
)

// 响应拦截
service.interceptors.response.use(
  response => {
    return response.data || response
  },
  async error => {
    const {status, msg} = error.response.data
    // const noPushList = ['/login']
    if (status === 401) {
      await logout()
      let res = await store.dispatch('setExpireLogin', true).then(() => store.getters.expireLogin).catch(res => res)
      console.log(res)
    } else if (notEmpty(msg)) {
      await store.dispatch('setMsg', {
        show: true,
        color: 'red',
        timeout: 5000,
        text: msg
      })
    }
    return Promise.reject(error.response)
  }
)

/**
 * @description 白名单，不添加token的接口
 * */
const notAddToken = (url) => [
  'login'
].some(item => url === item)

export default service
