<template>
  <div id="appBar">
    <v-app-bar-nav-icon @click.stop="navigationSet" ></v-app-bar-nav-icon>

    <v-spacer></v-spacer>

    <v-app-bar-nav-icon @click.stop="settingsSet">
      <v-btn icon><v-icon>mdi-cog-outline</v-icon></v-btn>
    </v-app-bar-nav-icon>

    <v-btn icon v-if="false"><v-icon>mdi-bell-outline</v-icon></v-btn>

    <v-menu bottom min-width="200px" rounded offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on" elevation="1">
          <v-avatar  v-if="$notEmpty(avatar)" size="40">
            <img :src="$addBaseURL(avatar)"  alt=""/>
          </v-avatar>
          <v-avatar size="40"  v-else>
            <v-btn icon><v-icon>mdi-account-circle</v-icon></v-btn>
          </v-avatar>
        </v-btn>
      </template>
      <v-card >
        <v-list-item-content class="justify-center">
          <div class="mx-auto text-center">
            <v-avatar  v-if="$notEmpty(avatar)">
              <img :src="$addBaseURL(avatar)"  alt=""/>
            </v-avatar>
            <v-icon v-else>mdi-account-circle</v-icon>

            <h3 class="mt-2">{{nickname}}</h3>
            <p class="mt-1">{{username}}</p>
            <v-divider class="my-3"></v-divider>
            <v-btn depressed rounded text v-if="false">
              Edit Account
            </v-btn>
            <v-divider class="my-3" v-if="false"></v-divider>
            <v-btn depressed shaped text @click="logout">退出登录</v-btn>
          </div>
        </v-list-item-content>
      </v-card>
    </v-menu>

  </div>
</template>

<script>
  import {logout} from "@/utils/auth";

  export default {
    name: "appBar",
    data() {
      return {}
    },
    computed:{
      avatar(){
        return this.$storeGet.user.avatar
      },
      nickname(){
        return this.$storeGet.user.nickname
      },
      username(){
        return this.$storeGet.user.username
      },
    },
    methods: {
      logout(){
        logout().then(() => {
          this.$router.replace({path: '/login'})
        })
      },
      navigationSet(){
        this.$emit('navigation-fun',)
      },
      settingsSet(){
        this.$emit('settings-fun',)
      },
    },

  }
</script>

<style lang="scss">
  #appBar{
    width: 100%;
    align-items: center;
    display: flex;
    position: relative;
    z-index: 0;
  }
</style>
