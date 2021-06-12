import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import zhHans from 'vuetify/es5/locale/zh-Hans';

Vue.use(Vuetify);

Vuetify.config.silent = true

export default new Vuetify({
  theme: {
    disable: false,
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#1867C0',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#DC3232',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
      dark: {
        primary: '#0096c7',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#DC3232',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
    },
  },
  lang: {
    locales: {zhHans},
    current: 'zh-Hans',
  },
});
