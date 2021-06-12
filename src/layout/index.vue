<template>
  <v-app id="layout">
    <v-app-bar app :dark="darkToolbar" :light="lightToolbar" :absolute="!fixToolbar" :elevation="elevationToolbar">
      <app-bar @navigation-fun="navigationFun" @settings-fun="settingsFun" />
    </v-app-bar>
    <v-navigation-drawer app v-model="navigation" width="220" floating :dark="darkThemeMenu" :light="lightThemeMenu" :mini-variant.sync="miniMenu">
      <drawer-navigation/>
    </v-navigation-drawer>
    <v-navigation-drawer fixed right v-model="settings" class="elevation-1" floating temporary :dark="darkSetting" :light="lightSetting" >
      <drawer-settings @settings-fun="settingsFun"/>
    </v-navigation-drawer>

    <v-main class="main" :class="fixToolbar?['fixToolbarMain']:['notFixToolbarMain']">
      <v-container :fluid="contentLayoutFluid" class="mainContainer">
        <transition name="fade" mode="out-in">
          <router-view class="routerMain"/>
        </transition>
      </v-container>
      <v-footer class="mainFooter">
        <app-footer/>
      </v-footer>
    </v-main>



    <!--登陆提示框-->
    <v-dialog v-model="loginDialog" max-width="380" persistent>
      <v-card class="loginDialog">
        <v-btn color="primary" small class="closeBtn" icon @click="goLogin">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <container-login @close-login-dialog="loginDialog=false" comStatus="expireLogin"/>
      </v-card>
    </v-dialog>

    <!--消息提示-->
    <v-snackbar v-model="msgObj.show" :timeout="msgObj.timeout" :color="msgObj.color">
      {{ msgObj.text }}
      <template v-slot:action="{ attrs }">
        <v-btn  text v-bind="attrs" @click="msgObj.show=false" > OK </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
  export default {
    name: "layout",
    data() {
      return {
        navigation: true,
        settings: false,
      }
    },
    components: {
      AppBar: () => import('@/layout/AppBar'),
      DrawerNavigation: () => import('@/layout/DrawerNavigation'),
      DrawerSettings: () => import('@/layout/DrawerSettings'),
      AppFooter: () => import('@/layout/Footer'),
      ContainerLogin: () => import('@/views/login/components/ContainerLogin')
    },
    methods: {
      goLogin(){
        this.$router.push(`/login?redirect=${this.$route.path}`).catch(err=>console.warn(err))
      },
      navigationFun() {
        if (!this.miniMenu&&this.navigation&&!this.logoMenu)  this.miniMenu = !this.miniMenu;
        else this.navigation = !this.navigation;
      },
      settingsFun() {
        this.settings = !this.settings
      },
    },
    computed: {
      darkToolbar(){
        return this.$storeGet.setting.themesToolbar==='dark'
      },
      lightToolbar(){
        return this.$storeGet.setting.themesToolbar==='light'
      },
      darkThemeMenu(){
        return this.$storeGet.setting.themeMenu==='dark'
      },
      lightThemeMenu(){
        return this.$storeGet.setting.themeMenu==='light'
      },
      darkSetting(){
        return this.$storeGet.setting.themeSetting==='dark'
      },
      lightSetting(){
        return this.$storeGet.setting.themeSetting==='light'
      },
      contentLayoutFluid(){
        return this.$storeGet.setting.contentLayout==='fluid'
      },
      fixToolbar(){
        return this.$storeGet.setting.fixToolbar
      },
      elevationToolbar(){
        let v = this.$storeGet.setting.fixToolbar
        return v?1:0
      },
      logoMenu() {
        return this.$storeGet.setting.logoMenu;
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
      msgObj: {
        get() {
          return this.$storeGet.msg;
        },
        set(value) {
          this.$storeSet('msg', value)
        }
      },
      loginDialog: {
        get() {
          return this.$storeGet.expireLogin
        },
        set(newValue) {
          if (!newValue) this.$storeSet('setExpireLogin', newValue)
        }
      }
    },
  }
</script>

<style lang="scss">
  #layout {
    .notFixToolbarMain{
      .v-main__wrap{
        display: flex;
        flex-direction: column;
        .mainContainer{
          flex: 1 1 auto;
        }
        .mainFooter{
          flex: 0 0 auto;
        }
      }
    }
    .fixToolbarMain {
      .v-main__wrap{
        height: calc(100vh - 64px);
        display: flex;
        flex-direction: column;
        .mainContainer{
          flex: 1 1 auto;
          overflow: auto;
          .routerMain{

          }
        }
        .mainFooter{
          flex: 0 0 auto;
        }
      }
    }


    .loginDialog {
      padding-bottom: 20px;

      .closeBtn {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
  }
</style>
