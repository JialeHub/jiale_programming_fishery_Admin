import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './router/permission' // permission control
import store from './store'
import vuetify from './plugins/vuetify';
import myPlugin from './plugins/myPlugin';
import "@/styles/reset.scss"
import "@/styles/index.scss"
import "@/styles/common.scss"

Vue.config.productionTip = false
Vue.use(myPlugin)


import uploader from 'vue-simple-uploader'
Vue.use(uploader)
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
