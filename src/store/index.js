import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import Cookies from "js-cookie";
import settings from '@/settings'
import {deepClone, tryJSONParse, tryReadUnknown} from '@/utils/globalMethod'

Vue.use(Vuex)

// 自动获取modules下的*.js
const modulesFiles = require.context("./modules", true, /\.js$/);
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
  const value = modulesFiles(modulePath);
  modules[moduleName] = value.default;
  return modules;
}, {});
const cloneModules = deepClone(modules);

//持久化（关闭浏览器仍保留数据）
const plugins = navigator.cookieEnabled?[
  //登录信息
  createPersistedState({
    key: `${settings.prefix}-LOGIN`,
    storage: window.localStorage,
    reducer: val => ({login: val.login}),
  }),
  createPersistedState({
    key: `${settings.prefix}-SETTINGS`,
    storage: window.localStorage,
    reducer: val => ({settings: val.settings})
  }),
  createPersistedState({
    key: `${settings.prefix}-TOKEN`,
    storage: {
      getItem: key => Cookies.get(key),
      setItem: (key, value) =>{
        Cookies.set(key, value, {expires: tryReadUnknown(tryJSONParse(window.localStorage.getItem(`${settings.prefix}-LOGIN`)),".info.rememberMe") ? settings.tokenCookieExpires : 1})
        Cookies.set('token', tryReadUnknown(tryJSONParse(value),'.token.token'), {expires: tryReadUnknown(tryJSONParse(window.localStorage.getItem(`${settings.prefix}-LOGIN`)),".info.rememberMe") ? settings.tokenCookieExpires : 1})
      },
      removeItem: key => {
        Cookies.remove(key)
        Cookies.remove('token')
      }
    },
    reducer: val => ({token: val.token})
  })
]:[]

const store = new Vuex.Store({
  modules,
  plugins
})

// 重置vuex
export const resetStore = () => {
  for (let module in store.state) {
    if (['info', 'settings'].includes(module)) continue
    for (let key in store.state[module]){
      store.state[module][key] = deepClone(cloneModules[module].state[key])
    }
  }
}

export default store
