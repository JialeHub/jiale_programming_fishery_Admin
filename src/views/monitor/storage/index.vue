<template>
  <div class="storage">
    storage
    <img :src="src" alt="" @click="test" style="cursor: pointer">
  </div>
</template>

<script>

  import {testApi} from "@/api/modules";
  export default {
    name: 'storage',
    components: {},
    data() {
      return {
        src:''
      };
    },
    methods: {
      test(){
        testApi().then(response => {
          this.src=response.img
        }).catch(error => {
          console.log(error);
        })
      }
    },
    mounted() {
      this.test()
    },
  }
</script>

<style lang="scss">
  #storage {
  }
</style>
