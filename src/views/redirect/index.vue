<template>
  <div>正在跳转...</div>
</template>

<script>
  import {logout} from "@/utils/auth";

  export default {
    name: 'redirect',
    created() {
      const {params, query} = this.$route
      const {path} = params
      if(path === "reLogin"){
        logout().then(() => {
          this.$router.replace({path: '/login'})
        })
      }else {
        this.$router.replace({path: '/' + path, query})
      }
    },
    render: function (h) {
      return h() // avoid warning message
    }
  }
</script>
