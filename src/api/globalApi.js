// import * as modulesApi from './Modules'
// import * as httpApi from './http'

// 自动获取modules下的*.js
const modulesFiles = require.context('./modules', true, /\.js$/)
let modulesApi = modulesFiles.keys().reduce((modules, modulePath) => {
  // const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  for (let key in modulesFiles(modulePath)) {
    modules[key] = modulesFiles(modulePath)[key]
  }
  return modules
}, {})

// 自动获取http下的*.js
const httpFiles = require.context('./http', true, /\.js$/)
let httpApi = httpFiles.keys().reduce((modules, modulePath) => {
  // const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  for (let key in modulesFiles(modulePath)) {
    modules[key] = modulesFiles(modulePath)[key]
  }
  return modules
}, {})

export default {...modulesApi, ...httpApi}
