<template>
  <v-list-item-action>
    <v-list-item-action-text v-if="$notEmpty(text)">
      {{text}}
      <slot name="text"/>
    </v-list-item-action-text>
    <slot/>
  </v-list-item-action>
</template>

<script>
  export default {
    name: "listItemAction",
    props: {
      text:{
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
