<template>
  <transition name="fade" mode="out-in">
    <router-view class="routerItem"/>
  </transition>
</template>

<script>
export default {
  name: "routerItem",
}
</script>