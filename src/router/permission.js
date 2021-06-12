import {visitApi} from "@/api/modules";
import store from "@/store/index";
import router, {asyncRoutes} from "./index";
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
import {notEmpty} from "@/utils/globalMethod";
import {filterAsyncRoutes, getUserInfoMenu, logout} from "@/utils/auth"; // get token from cookie


NProgress.configure({showSpinner: false}) // NProgress Configuration 进度条配置


const whiteList = ['/login','/404','/403'] // no redirect whitelist 没有重定向白名单

router.beforeEach(async (to, from, next) => {
  NProgress.start()//进度条开始
  document.title = getPageTitle(to.meta.title) //设置页面标题
  visitApi().then() //路由访问记录

  const hasToken = notEmpty(store.getters.token)
  if (hasToken) {
    if (to.path === '/login') {
      next({path: '/'})
      NProgress.done()
    } else {
      const hasUserInfo = notEmpty(store.getters.user)
      if (hasUserInfo) {
        next()
      } else {
        try {
          await getUserInfoMenu().catch(err=>{
            console.warn(err);
            throw new Error(err)
          });
          // 动态添加可访问路由(后台传来的，就不需要前端写路由表了)
          const accessRoutes = [...asyncRoutes, ...filterAsyncRoutes(store.getters.menu),{ path: '*', redirect: '/error/404' }];
          await router.addRoutes(accessRoutes)
          // 确保addRoutes是完整的 ;  设置replace: true，这样导航将不会留下历史记录
          next({...to, replace: true})
        } catch (error) {
          await logout()// 删除令牌，转到登录页面重新登录
          alert('【登录错误】'+error);
          next(`/login?redirect=${to.path}`)
          NProgress.done()

        }
      }
    }
  } else {
    //没有token
    if (whiteList.indexOf(to.path) !== -1) {
      next() // 没有重定向白名单允许继续访问
    } else {
      // 其他没有访问权限的页面被重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
