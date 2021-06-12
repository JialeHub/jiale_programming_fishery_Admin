import {axiosPostJ, axiosG, axiosD, axiosPutJ} from '@/api/axios'

export const visitApi = data => axiosG('/', data) //登记

export const loginApi = data => axiosPostJ('/user/login', data) //登录
export const logoutApi = data => axiosD('/user/logout', data) //退出登录
export const getUserInfoApi = data => axiosG('/user/info', data) //拉取用户信息
export const initMenuApi = data => axiosG('/user/initMenu', data) //获取菜单更新权限
export const sendForgetEmailApi = data => axiosG('/user/sendForgetEmail', data) //发送找回密码验证码邮件
export const getForgetPassTokenApi = data => axiosG('/user/getForgetPassToken', data) //邮件验证并返回重置密码临时Token
export const updatePassBySessionTokenApi = data => axiosPostJ('/user/updatePassBySessionToken', data) //sessionToken验证并设置新密码
export const getLoginCaptchaApi = data => axiosG('/user/getLoginCaptcha', data) //获取登录验证码

export const userListApi = data => axiosG('/user/list', data) //获取用户列表
export const readUserApi = (data) => axiosG('/user/read', data) //读取指定用户
export const delUserApi = (data) => axiosD('/user/del', data) //获取用户列表
export const addUserApi = (data) => axiosPostJ('/user/add', data) //新增用户
export const editUserApi = (data) => axiosPutJ('/user/edit', data) //编辑用户

export const roleListApi = data => axiosG('/role/list', data) //获取角色列表
export const readRoleApi = (data) => axiosG('/role/read', data) //读取指定角色
export const delRoleApi = (data) => axiosD('/role/del', data) //获取角色列表
export const addRoleApi = (data) => axiosPostJ('/role/add', data) //新增角色
export const editRoleApi = (data) => axiosPutJ('/role/edit', data) //编辑角色

export const deptListApi = (data) => axiosG('/dept/list', data) //获取部门列表
export const delDeptApi = (data) => axiosD('/dept/del', data) //获取部门列表
export const addDeptApi = (data) => axiosPostJ('/dept/add', data) //新增部门
export const editDeptApi = (data) => axiosPutJ('/dept/edit', data) //编辑部门
// export const exportDeptApi = (data) => axiosG('/dept/edit', data) //导出部门

export const menuListApi = (data) => axiosG('/menu/list', data) //获取菜单列表
export const delMenuApi = (data) => axiosD('/menu/del', data) //获取菜单列表
export const addMenuApi = (data) => axiosPostJ('/menu/add', data) //新增菜单
export const editMenuApi = (data) => axiosPutJ('/menu/edit', data) //编辑菜单
// export const exportMenuApi = (data) => axiosG('/menu/edit', data) //导出菜单

export const articleListApi = data => axiosG('/article/list', data) //获取文章列表
export const readArticleApi = (data) => axiosG('/article/read', data) //读取指定文章
export const delArticleApi = (data) => axiosD('/article/del', data) //获取文章列表
export const addArticleApi = (data) => axiosPostJ('/article/add', data) //新增文章
export const editArticleApi = (data) => axiosPutJ('/article/edit', data) //编辑文章

export const publishListApi = data => axiosG('/publish/list', data) //获取发表列表
export const readPublishApi = (data) => axiosG('/publish/read', data) //读取指定发表
export const delPublishApi = (data) => axiosD('/publish/del', data) //获取发表列表
export const addPublishApi = (data) => axiosPostJ('/publish/add', data) //新增发表
export const editPublishApi = (data) => axiosPutJ('/publish/edit', data) //编辑发表

export const getCollectApi = (data) => axiosG('/publish/collectList', data) //获取用户汇总分数列表


