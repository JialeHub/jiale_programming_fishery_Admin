<template>
  <v-list-item-icon>
    <v-icon v-if="$notEmpty(name)" :size="size" :color="color" >{{name}}</v-icon>
    <slot/>
  </v-list-item-icon>
</template>

<script>
  export default {
    name: "listItemIcon",
    props: {
      name:{
        type:String,
        default:'',
      },
      size:{
        type:String,
        default:'',
      },
      color:{
        type:String,
        default:'',
      },
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
