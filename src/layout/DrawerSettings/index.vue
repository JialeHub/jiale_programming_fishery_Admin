<template>
  <div id="drawerSettings">
    <v-list>
      <settings-item itemTitle="系统设置" itemSubtitle="Settings">
        <template #action>
          <v-btn icon @click="closeSettings">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </settings-item>
      <v-divider />
    </v-list>
    <v-list>
      <settings-item itemTitle="主题">
        <v-btn-toggle v-model="themes" borderless color="primary" dense slot="subtitle">
          <v-btn value="light"><span>明亮</span></v-btn>
          <v-btn value="dark"><span>夜间</span></v-btn>
        </v-btn-toggle>
      </settings-item>
      <settings-item itemTitle="菜单主题">
        <v-btn-toggle v-model="themeMenu" borderless color="primary" dense slot="subtitle">
          <v-btn value="global"><span>全局</span></v-btn>
          <v-btn value="light"><span>明亮</span></v-btn>
          <v-btn value="dark"><span>夜间</span></v-btn>
        </v-btn-toggle>
      </settings-item>
      <settings-item itemTitle="工具栏主题">
        <v-btn-toggle v-model="themesToolbar" borderless color="primary" dense slot="subtitle">
          <v-btn value="global"><span>全局</span></v-btn>
          <v-btn value="light"><span>明亮</span></v-btn>
          <v-btn value="dark"><span>夜间</span></v-btn>
        </v-btn-toggle>
      </settings-item>
      <settings-item itemTitle="设置栏主题">
        <v-btn-toggle v-model="themeSetting" borderless color="primary" dense slot="subtitle">
          <v-btn value="global"><span>全局</span></v-btn>
          <v-btn value="light"><span>明亮</span></v-btn>
          <v-btn value="dark"><span>夜间</span></v-btn>
        </v-btn-toggle>
      </settings-item>
      <settings-item itemTitle="内容布局">
        <v-btn-toggle v-model="contentLayout" borderless color="primary" dense slot="subtitle">
          <v-btn value="fluid"><span>满屏</span></v-btn>
          <v-btn value="boxed"><span>居中</span></v-btn>
        </v-btn-toggle>
      </settings-item>
      <settings-item itemTitle="工具栏固定">
        <template #right><v-switch v-model="fixToolbar"></v-switch></template>
      </settings-item>
      <settings-item itemTitle="迷你菜单">
        <template #right><v-switch v-model="miniMenu"></v-switch></template>
      </settings-item>
      <settings-item itemTitle="显示Logo">
        <template #right><v-switch v-model="logoMenu"></v-switch></template>
      </settings-item>
    </v-list>
  </div>
</template>

<script>
  export default {
    name: "drawerSettings",
    components: {
      settingsItem: () => import('@/components/ListItem/index')
    },
    computed: {
      themes: {
        get() {
          let v = this.$storeGet.setting.themes;
          this.setThemes(v)
          return v;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'themes',
            value: value
          })
        }
      },
      contentLayout: {
        get() {
          return this.$storeGet.setting.contentLayout;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'contentLayout',
            value: value
          })
        }
      },
      themeMenu: {
        get() {
          return this.$storeGet.setting.themeMenu;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'themeMenu',
            value: value
          })
        }
      },
      themesToolbar: {
        get() {
          return this.$storeGet.setting.themesToolbar;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'themesToolbar',
            value: value
          })
        }
      },
      themeSetting: {
        get() {
          return this.$storeGet.setting.themeSetting;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'themeSetting',
            value: value
          })
        }
      },
      fixToolbar: {
        get() {
          return this.$storeGet.setting.fixToolbar;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'fixToolbar',
            value: value
          })
        }
      },
      logoMenu: {
        get() {
          return this.$storeGet.setting.logoMenu;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'logoMenu',
            value: value
          })
        }
      },
      miniMenu: {
        get() {
          return this.$storeGet.setting.miniMenu;
        },
        set(value) {
          this.$storeSet('changeSetting', {
            key: 'miniMenu',
            value: value
          })
        }
      },
    },
    data() {
      return {}
    },
    methods: {
      closeSettings() {
        this.$emit('settings-fun')
      },
      setThemes(res) {
        this.$vuetify.theme.dark = (res === 'dark')
      }
    },
  }
</script>

<style lang="scss">

</style>
