<template>
  <v-list-item-avatar>
    <v-img :src="src" v-if="$notEmpty(src)"></v-img>
    <slot/>
  </v-list-item-avatar>
</template>

<script>
  export default {
    name: "listItemAvatar",
    props: {
      src:{
        type:String,
        default:'',
      }
    },
    data(){
      return{

      }
    },
    mounted() {
      // console.log(this.$slots);
    },
  }
</script>

<style lang="scss">

</style>
