<template>
  <v-app id="login">
    <v-main>
      <transition name="fade" mode="out-in">
        <container-login/>
      </transition>
    </v-main>
  </v-app>
</template>

<script>

  export default {
    name: 'Login',
    components: {
      ContainerLogin: ()=>import('./components/ContainerLogin')
    }
  }
</script>

<style lang="scss">
  #login {

  }
</style>
