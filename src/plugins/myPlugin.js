import * as globalMethod from '@/utils/globalMethod'
import globalApi from '@/api/globalApi'
import store,{resetStore} from '@/store'

/*****************************************************/
//断言，为编辑器导航,无实质用途
let assert = {
  $api: globalApi,
  $getDateDiff: globalMethod.getDateDiff,
  $formatDate: globalMethod.formatDate,
  $notEmpty: globalMethod.notEmpty,
  $sizeToStr: globalMethod.sizeToStr,
  $addBaseURL: globalMethod.addBaseURL,
  $deepClone: globalMethod.deepClone,
  $tryJSONStringify: globalMethod.tryJSONStringify,
  $tryJSONParse: globalMethod.tryJSONParse,
  $tryReadUnknown: globalMethod.tryReadUnknown,
  $objectEvaluate: globalMethod.objectEvaluate,
  $treeFindChildrens: globalMethod.treeFindChildrens,
  $tree2list: globalMethod.tree2list,
  $findLeafFamilyList: globalMethod.findLeafFamilyList,
  $findLeafNodes: globalMethod.findLeafNodes,
  $storeSet: store.dispatch,
  $resetStore: resetStore,
}
//清空assert指向的对象
for(let key in assert){delete assert[key];}
/*****************************************************/

const myPlugin = {
  install(Vue) {

    // 注入组件选项
    Vue.mixin({
      methods: assert,
      computed: {
        '$query'() {
          return this.$route.query
        },
        '$storeGet'() {
          return this.$store.getters
        },
        '$settings'() {
          return this.$store.getters.setting
        },
      }
    })

    //动态绑定全部实例方法,但不能被编辑器识别
    for (let key in globalMethod) {
      Vue.prototype['$' + key] = globalMethod[key]
    }

    Vue.prototype['$storeSet'] = store.dispatch
    Vue.prototype['$resetStore'] = resetStore
    // Vue.prototype['$api'] = globalApi
    //按需绑定
    // Vue.prototype.$notEmpty = globalMethod.notEmpty
    // Vue.prototype.$addBaseURL = globalMethod.addBaseURL

  }
}
export default myPlugin

