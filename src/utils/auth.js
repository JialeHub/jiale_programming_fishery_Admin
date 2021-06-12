import store from "@/store";
import {RSAEncrypt} from "@/utils/cryptology";
import {getUserInfoApi, initMenuApi, loginApi, logoutApi} from "@/api/modules";
import {addBaseURL, notEmpty} from "@/utils/globalMethod";
import {resetRouter} from "@/router";

/**
 * @param form
 * @return {Promise}
 * @description 登录
 * */
export async function login(form) {
  await logout();
  let data = {...form}
  data['password'] = RSAEncrypt(form['password'])
  delete data.showPass
  return new Promise((resolve, reject) => {
    loginApi(data).then(async res => {
      if (res.status === 200) {
        await store.dispatch('setRememberMe', {
          rememberMe: form.rememberMe,
          username: form.username
        });
        await store.dispatch('setToken', res['token'])
        // 登陆后直接刷新跳转进首页，那时候再拉取
        // await getUserInfoMenu().catch(err=>reject(err));
        resolve(res)
      } else {
        reject(res)
      }
    }).catch(err => {
      let serverError = notEmpty(err['data']);//判断是否为网络错误
      if (!serverError) console.error(err);//打印非网络错误
      let res = serverError ? err['data'] : {};
      res['errorType'] = 'error';
      reject(res)
    })
  })
}

/**
 * @return {Promise}
 * @description 获取个人信息和菜单
 * */
export async function getUserInfoMenu() {
  await store.dispatch('changeSetting', {key: 'appLoading', value: true}).catch(err => err)
  return new Promise((resolve, reject) => {
    getUserInfo().then(res1 => {
      getMenu().then(res2 => resolve([res1, res2])).catch(err => reject(err)).finally(() => store.dispatch('changeSetting', {
        key: 'appLoading',
        value: false
      }).catch(err => err))
    }).catch(err => reject(err)).finally(() => store.dispatch('changeSetting', {
      key: 'appLoading',
      value: false
    }).catch(err => err))
  })
}

/**
 * @return {Promise}
 * @description 获取个人信息
 * */
export function getUserInfo() {
  return new Promise((resolve, reject) => {
    if (notEmpty(store.getters.token)) {
      getUserInfoApi().then(async res => {
        if (res.status === 200) {
          await store.dispatch('setUser', res['info'])
          resolve(res['info'])
        } else {
          reject(res)
        }
      }).catch(err => {
        reject(err)
      })
    } else {
      resolve('请先登录！')
    }
  })
}

/**
 * @return {Promise}
 * @description 拉取菜单
 * */
export function getMenu() {
  return new Promise((resolve, reject) => {
    if (notEmpty(store.getters.token)) {
      initMenuApi().then(async res => {
        if (res.status === 200) {
          let allHidden = res['menu'].map(item=>item['hidden'])
          if (notEmpty(allHidden) && allHidden.reduce((total, num)=>total * num)===0){
            await store.dispatch('setMenu', res['menu'])
            resolve(res['menu'])
          }else{
            reject('暂无可用菜单')
          }
        }else {
          console.log(res)
          reject(res)
        }
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    } else {
      resolve('请先登录！')
    }
  })
}


/**
 * @return {Promise}
 * @description 注销
 * */
export async function logout() {
  if (notEmpty(store.getters.token)) await logoutApi({}).catch(err => err);
  await Promise.all([
    store.dispatch('setToken', ''),
    store.dispatch('setUser', {}),
    store.dispatch('setMenu', [])
  ])
  resetRouter();
}


/**
 * @return {Array}
 * @description 通过递归过滤异步路由表
 * */
export function filterAsyncRoutes(routes) {
  const res = []
  routes.forEach(route => {
    const tmp = {...route}
    if (tmp['addRoutes']) {

      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children)
      }
      let tmp2 = {meta: {}}
      if (notEmpty(tmp['name'])) tmp2['name'] = tmp['name']
      if (notEmpty(tmp['path'])) tmp2['path'] = tmp['path']
      if (notEmpty(tmp['component'])) tmp2['component'] = tmp['component']
      if (notEmpty(tmp['redirect'])) tmp2['redirect'] = tmp['redirect']
      if (notEmpty(tmp['children'])) tmp2['children'] = tmp['children']
      if (notEmpty(tmp['title'])) tmp2['meta']['title'] = tmp['title']
      if (notEmpty(tmp['permission'])) tmp2['meta']['permission'] = tmp['permission']
      if (notEmpty(tmp['icon'])) tmp2['meta']['icon'] = tmp['icon']
      if (notEmpty(tmp['cache'])) tmp2['meta']['cache'] = tmp['cache']
      if (notEmpty(tmp['hidden'])) tmp2['meta']['hidden'] = tmp['hidden']
      if (notEmpty(tmp['model'])) tmp2['meta']['model'] = tmp['model']
      if (notEmpty(tmp['alwaysShow'])) tmp2['meta']['alwaysShow'] = tmp['alwaysShow']
      if (notEmpty(tmp['breadcrumb'])) tmp2['meta']['breadcrumb'] = tmp['breadcrumb']
      if (notEmpty(tmp['affix'])) tmp2['meta']['affix'] = tmp['affix']
      if (notEmpty(tmp['activeMenu'])) tmp2['meta']['activeMenu'] = tmp['activeMenu']
      if (notEmpty(tmp2['component'])) {
        if (tmp2['component'] === 'Layout') { // Layout组件特殊处理
          tmp2['component'] = () => import('@/layout/index')
        } else if (tmp2['component'] === 'Router') { // Router组件特殊处理
          tmp2['component'] = () => import('@/components/routerItem')
        } else {
          let src = addBaseURL(tmp2['component'], true)
          tmp2['component'] = () => import(`@/views${src}`)
        }
      }
      res.push(tmp2)
    }
  })
  return res
}
