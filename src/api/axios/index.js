import service from './service'
import qs from 'qs'

/**
 * @author 王业鹏
 * @description {[]}: 对象中可带数组； {}：对象。
 * @example axiosH   head     {} 测试连通性
 * @example axiosG   get     {[]} 获取
 * @example axiosD   delete  {[]} 删除
 * @example axiosA   post    {[]} 新增
 * @example axiosM   put     {[]} 修改
 * @example axiosL   get     {[]} 下载
 * @example axiosPostK   post    x-www-form-urlencoded {} 新增
 * @example axiosPutK   put     x-www-form-urlencoded {} 修改
 * @example axiosPostJ   post    json {} 新增
 * @example axiosU   put     json {} 修改
 * @example axiosF   post    form-data FormData() 上传
 * @example axiosFs  post    form-data {[]} 上传
 * */

/**
 * @param {String} url 请求地址
 * @param {Object=} param 参数
 * @description get
 * */
export const axiosH = (url, param) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'head',
      url: url,
      params: param,
      headers: { 'X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params)
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param {Object=} param 参数
 * @description get
 * */
export const axiosG = (url, param) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'get',
      url: url,
      params: param,
      headers: { 'X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params)//, { arrayFormat: 'repeat' }
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param {Object=} param 请求地址
 * @description delete，删除数据。
 * */
export const axiosD = (url, param) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'delete',
      url: url,
      params: param,
      headers: { 'X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params)
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param {Object} param {name: LiHua, age: 18}
 * @description post，键值对格式。
 * */
export const axiosPostK = (url, data,params) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'post',
      url: url,
      params: params,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded','X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params),
      transformRequest: data => qs.stringify(data)
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param data
 * @param {Object} params {name: LiHua, age: 18}
 * @description post，JSON格式。
 * */
export const axiosPostJ = (url,data, params) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'post',
      url: url,
      data: data,
      params: params,
      headers: { 'Content-Type': 'application/json','X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params),
      transformRequest: data => JSON.stringify(data),
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param data
 * @param {Object} params {name: LiHua, age: 18}
 * @description put，键值对格式。
 * */
export const axiosPutK = (url,data, params) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'put',
      url: url,
      params: params,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded','X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params),
      transformRequest: data => qs.stringify(data)
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param data
 * @param {Object} param {name: LiHua, age: 18}
 * @description put，JSON格式。
 * */
export const axiosPutJ = (url,data, param) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'put',
      url: url,
      data: data,
      params: param,
      headers: { 'Content-Type': 'application/json','X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params),
      transformRequest: data => JSON.stringify(data),
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param {FormData} param new FormData()
 * @description post，文件格式。
 * */
export const axiosF = (url, param) => {
  return service({
    method: "post",
    url: url,
    data: param,
    headers: {"Content-Type": "multipart/form-data",'X-Requested-With':'XMLHttpRequest'}
  })
};


/**
 * @param {String} url 请求地址
 * @param {Object} param {id: 1, file: [1.png, 2.png]}
 * @param {Function=} callback 回调函数
 * @param {Object=} source 中断请求
 * @description post，文件格式。
 * */
export const axiosFs = (url, param, callback = undefined, source = undefined) => {
  let cancelToken
  if (source) cancelToken = source.token
  return new Promise((resolve, reject) => {
    service({
      method: 'post',
      timeout: 10 * 60 * 1000,
      url: url,
      data: param,
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Requested-With':'XMLHttpRequest'
      },
      transformRequest: [
        data => {
          const formData = new FormData()
          for (const key in data) {
            /* data.hasOwnProperty(key) */
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              if (data[key] instanceof Array) {
                for (let i = 0; i < data[key].length; i++) { formData.append(key, data[key][i]) }
              } else { formData.append(key, data[key]) }
            }
          }
          return formData
        }
      ],
      cancelToken: cancelToken,
      onUploadProgress: progress => {
        if (callback) { callback(Math.round((progress.loaded / progress.total) * 100)) }
      }
    })
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}

/**
 * @param {String} url 请求地址
 * @param {Object=} param 请求地址
 * @param fileName 文件名
 * @description 下载文件。
 * */
export const axiosL = (url, param,fileName) => {
  return new Promise((resolve, reject) => {
    service({
      method: 'get',
      url: url,
      responseType: 'blob',
      params: param,
      headers: { 'X-Requested-With':'XMLHttpRequest' },
      paramsSerializer: params => qs.stringify(params)
    })
      .then(result => {
        if (!result) {
          return
        }
        let url = window.URL.createObjectURL(new Blob([result],{type:result.type}))
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        resolve(result)
      })
      .catch(error => reject(error))
  })
}
