<template>
  <v-list-group no-action class="nestedMenu" :sub-group="deep>0" :prepend-icon="menu['icon']" ><!--有children-->
    <template #activator><!--目录-->
      <v-list-item-content two-line>
        <v-list-item-title>{{menu['title']}}</v-list-item-title>
      </v-list-item-content>
    </template>
    <div v-for="item in menu['children']" :key="item['id']" class="nestedList">
      <!--没有children-->
      <menu-item class="pl-8" v-if="!$notEmpty(item['children'])&&!item['hidden']" :itemTitle="item['title']" :icon="item['icon']" :value="item['id']" :link="pLink+$addBaseURL(item['path'],true)"></menu-item>
      <!--有children-->
      <nested-menu  v-if="$notEmpty(item['children']) && deep!==2 && !item['hidden']" :menu="item" :deep="deep+1" :key="item['id']" :pLink="pLink+$addBaseURL(item['path'],true)"/>
    </div>
  </v-list-group>
</template>

<script>
  export default {
    name: "NestedMenu",
    data() {
      return {}
    },
    props: {
      deep:{
        type:Number,
        default:0,
      },
      menu:{
        type:Object,
      },
      pLink:{
        type:String,
      },
    },
    components: {
      MenuItem: () => import('@/components/ListItem/index'),
      NestedMenu: ()=> import('@/layout/DrawerNavigation/components/NestedMenu.vue')
    },
  }
</script>

<style lang="scss">
  .nestedMenu{
    .nestedList{
      .v-list-item__title{
        font-size: 14px;
      }
    }
  }
  .nestedList {
    background-color: rgba(246,247,248,1)
  }
  .v-navigation-drawer.theme--dark .nestedList {
    background-color: rgba(20,30,40,0.8)
  }

</style>
