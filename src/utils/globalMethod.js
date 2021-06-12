// export {RSAEncrypt} from './cryptology'
import {format} from 'silly-datetime'
/**
 * @param value
 * @return {Boolean}
 * @description 判断是否为空
 * */
export const notEmpty = value => {
  return !(
    value === undefined
    || value === null
    || (typeof value === "object" && Object.keys(value).length === 0)
    || (typeof value === "string" && value.trim().length === 0)
  );
};

/**
 * @param string
 * @param noAddBase
 * @return {String}
 * @description 添加URL地址+自动去除第一斜杠
 * */
export const addBaseURL = (string, noAddBase) => {
  if (string && string !== '') {
    if (string.charAt(0) !== '/' && string.charAt(0) !== '\\') {
      string = '/' + string
    }
    if (string.charAt(string.length - 1) === '/') {
      string = string.substr(0, string.length - 1)
    }
    if (noAddBase === true) {
      return string
    } else {
      return process.env.VUE_APP_BASE_URL + string
    }
  } else {
    return ''
  }
}

/**
 * @return {String}
 * @description 文件大小转化
 * @param size
 * */
export const sizeToStr = (size) => {
  let data = "";
  if (size < 0.1 * 1024) { //如果小于0.1KB转化成B
    data = size.toFixed(2) + "B";
  } else if (size < 0.1 * 1024 * 1024) {//如果小于0.1MB转化成KB
    data = (size / 1024).toFixed(2) + "KB";
  } else if (size < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB
    data = (size / (1024 * 1024)).toFixed(2) + "MB";
  } else { //其他转化成GB
    data = (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  let sizeStr = data + "";
  let len = sizeStr.indexOf(".");
  let dec = sizeStr.substr(len + 1, 2);
  if (dec === "00") {//当小数点后为00时 去掉小数部分
    return sizeStr.substring(0, len) + sizeStr.substr(len + 3, 2);
  }
  return sizeStr;
}

/**
 * @param data
 * @return {String}
 * @description 尝试JSON格式化
 * */
export const tryJSONStringify = (data) => {
  try {
    return JSON.stringify(data)
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.warn('JSON转化失败：', data)
    return data
  }
}

/**
 * @param data
 * @description 尝试JSON解析
 * */
export const tryJSONParse = (data) => {
  try {
    return JSON.parse(data)
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.warn('json解析失败：', data)
    return data
  }
}

/**
 * @param {string} objPath
 * @param {object} source
 * @description 尝试读取未知对象 例tryReadUnknown(INFO,".info.rememberMe")
 */
export const tryReadUnknown = (source,objPath ) => {
  let successFlag = true
  const objStrArr = objPath.split('.')
  const objStr = [...objStrArr]
  objStr.shift()
  let objTemp = source
  let i
  try {
    for (i = 0; i < objStr.length; i++) {
      if (objTemp[objStr[i]] !== undefined) {
        objTemp = objTemp[objStr[i]]
      } else {
        successFlag = false
        break
      }
    }
    return successFlag ? objTemp : undefined;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.warn(e)
    return undefined
  }
}

/**
 * @description 深拷贝函数
 **/
export function deepClone(data,allowKey) {
  const type = (obj) => {
    let toString = Object.prototype.toString;
    let map = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Undefined]': 'undefined',
      '[object Null]': 'null',
      '[object Object]': 'object'
    };
    return map[toString.call(obj)];
  }
  let t = type(data), o, i, ni;
  if (t === 'array') {
    o = [];
  } else if (t === 'object') {
    o = {};
  } else {
    return data;
  }
  if (t === 'array') {
    for (i = 0, ni = data.length; i < ni; i++) {
      o.push(deepClone(data[i],allowKey));
    }
    return o;
  } else if (t === 'object') {
    for (i in data) {
      if (Object.prototype.hasOwnProperty.call(data, i)) {
        if (notEmpty(allowKey) && allowKey.includes(i)){
          o[i] = deepClone(data[i],allowKey);
        }else{
          o[i] = deepClone(data[i]);
        }
      }
    }
    return o;
  }
}

/* 返回树结构的所有子节点 */
export function treeFindChildrens(allArr = [], id = null, targetList=[]){
  allArr.forEach(item => {
    if (item['pid'] === id) {
      targetList.push(item);
      treeFindChildrens(allArr, item['id'], targetList)
    }
  })
  return targetList;
}

/* 树结构转节点数组 */
export function tree2list(childrenNode,nodes=[],pid=null){
  childrenNode.forEach(item=>{
    let node = {...item}
    delete node.children
    nodes.push({...node,pid:pid})
    if (notEmpty(item.children)){
      tree2list(item.children,nodes,item.id)
    }
  })
  return nodes;
}

/* 克隆树 */
export function treeCopy(childrenNode,nodes=[],pid=null){
  childrenNode.forEach(item=>{
    let node = {...item}
    delete node.children
    nodes.push({...node,pid:pid})
    if (notEmpty(item.children)){
      tree2list(item.children,nodes,item.id)
    }
  })
  return nodes;
}

/* 树结构转节点数组 */
export function findLeafFamilyList(leafList,nodeMap){
  let findLeafFamily = (leafNodes,PItem)=>{
    if (!leafNodes.includes(PItem.pid)) {
      let PPItem = nodeMap.find(item=>item.id === PItem.pid)
      if(this.$notEmpty(PPItem)) findLeafFamily(leafNodes, PPItem)
    }
    if (!leafNodes.includes(PItem.id)) leafNodes.push(PItem.id);
    return leafNodes
  }
  let leafFamilyList = [...leafList]
  leafFamilyList.forEach(itemId=>{
    let itemSelf = nodeMap.find(item=>item.id===itemId)
    let PItem = nodeMap.find(item=>item.id===itemSelf.pid)
    if(this.$notEmpty(PItem)) findLeafFamily(leafFamilyList,PItem)
  })
  return leafFamilyList
}

/* 找出所有叶子节点 */
export function findLeafNodes(treeNodes,LeafNodes=[]){
  treeNodes.forEach(item=>{
    if(notEmpty(item.children)){
      findLeafNodes(item.children,LeafNodes)
    }else{
      LeafNodes.push(item)
    }
  })
  return LeafNodes;
}


/**
 * @param {Object} target
 * @param {Object} object
 * @description target从object中取值 target <= object
 * */
export const objectEvaluate = async (target, object) => {
  for (let key in target) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      if (object[key] instanceof Array) {
        target[key] = [...object[key]]
      } else {
        target[key] = object[key]
      }
    }
  }
};


/**
 * @param value 例： '2020-08-07T03:22:56.000+0000';
 * @return {String}
 * @description 兼容IOS时间转化
 * */
export const compatibleTime = (value) => {
  let newStr = value.replace(/-/g, '/').replace(/T/g, ' ');
  newStr = newStr.substr(0, newStr.indexOf('.'));
  newStr = new Date(new Date(newStr).getTime() + 3600 * 1000 * 8);
  return newStr;
}


/**
 * @description 过滤时间
 * @return {String}
 **/
export const formatDate = (value,timestamp = false,formatStr='YYYY-MM-DD HH:mm:ss') => {
  let tranValue = value
  if(typeof(tranValue)=='string' &&  tranValue.indexOf('T')!==-1) tranValue=compatibleTime(tranValue); //兼容IOS时间转化
  else tranValue=new Date(typeof(tranValue)=='string' ? tranValue.replace(/-/g, '/'):value).getTime();
  if(timestamp) return tranValue;
  else return format(tranValue , formatStr);
}

// 时间戳转多少分钟之前
export const getDateDiff = (dateTimeStamp)=> {
  // 时间字符串转时间戳
  let timestamp = new Date(dateTimeStamp).getTime();

  let minute = 1000 * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let month = day * 30;
  let year = day * 365;
  let now = new Date().getTime();
  let diffValue = now - timestamp;
  let result;
  if (diffValue < 0) {
    return;
  }
  let yearC = diffValue / year;
  let monthC = diffValue / month;
  let weekC = diffValue / (7 * day);
  let dayC = diffValue / day;
  let hourC = diffValue / hour;
  let minC = diffValue / minute;
  if (yearC >= 1) {
    result = "" + parseInt(yearC) + "年前";
  } else if (monthC >= 1) {
    result = "" + parseInt(monthC) + "月前";
  } else if (weekC >= 1) {
    result = "" + parseInt(weekC) + "周前";
  } else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天前";
  } else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时前";
  } else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟前";
  } else
    result = "刚刚";
  return result;
}
