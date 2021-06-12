<template>
  <v-list id="drawerNavigation">
    <menu-item v-if="miniMenu||logoMenu" :isLink="miniMenu" @click.stop.native="miniMenuChange">
      <template #left v-if="miniMenu">
        <v-icon>mdi-chevron-right</v-icon>
      </template>
      <template #title v-if="!miniMenu">
        <div class="d-flex align-center" v-if="logoMenu">
          <v-icon v-if="false" class="mr-3">mdi-bell</v-icon>
          <span class="font-weight-bold text-uppercase primary--text">{{ menuTitle }}</span>
        </div>
      </template>
      <template #subtitle v-if="logoMenu && !miniMenu">
        <div class="d-flex justify-space-between align-center">
          <span class="overline grey--text">{{ version }}</span>
          <v-btn icon @click.stop="miniMenu=!miniMenu">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </div>
      </template>
    </menu-item>
    <v-divider v-if="miniMenu||logoMenu"/>

    <!--动态导航栏-->
    <v-list-item-group v-model="activate" color="blue" @change="activateChange">
      <div v-for="item in menu" :key="item['id']">
        <menu-item v-if="!$notEmpty(item['children'])&&!item['hidden']" :icon="item['icon']" :value="item['id']"
                   :itemTitle="item['title']" :link="$addBaseURL(item['path'],true)"></menu-item><!--没有children-->
        <nested-menu v-if="$notEmpty(item['children'])&&!item['hidden']" :menu="item" :key="item['id']"
                     :pLink="$addBaseURL(item['path'],true)"></nested-menu>
      </div>
    </v-list-item-group>
  </v-list>
</template>

<script>
export default {
  name: "drawerNavigation",
  components: {
    MenuItem: () => import('@/components/ListItem/index'),
    NestedMenu: () => import('./components/NestedMenu')
  },
  data() {
    return {
      activate: ''
    }
  },
  mounted() {
    // console.log(this.menu);
  },
  methods: {
    activateChange() {
      // console.log(v);
    },
    miniMenuChange() {
      if (this.miniMenu) this.miniMenu = !this.miniMenu
    }
  },
  computed: {
    menu() {
      return this.$storeGet.menu.filter(item => item.component === 'Layout').map(item => item.children).reduce((acc, current) => acc.concat(current))
    },
    menuTitle() {
      return this.$storeGet.setting.menuTitle
    },
    version() {
      return this.$storeGet.setting.version
    },
    logoMenu() {
      return this.$storeGet.setting.logoMenu
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
  }
}
</script>

<style lang="scss">
#drawerNavigation {
  .v-list-item__title {
    font-size: 15px;
  }

  .v-list-item__icon {
    margin-right: 15px;

    .v-icon {
      font-size: 18px;
    }
  }
}

.v-list-item__title, .v-list-item__icon .v-icon {
  color: rgba(10, 20, 30, 0.9) !important;
}
.theme--dark .v-list-item__title, .v-list-item__icon .v-icon {
  color: rgba(255,255,255, 0.9) !important;
}

.v-navigation-drawer.theme--dark {
  .v-list-item__title, .v-list-item__icon .v-icon {
    color: rgba(220, 230, 240, 0.9) !important;
  }
}
</style>
