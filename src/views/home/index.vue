<template>
  <div id="home">
    嘉乐的程序设计 | 渔业信息采集系统
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {}
}
</script>

<style lang="scss">
#home {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  .iframe {
    flex: 1 1 auto;
    min-height: calc(100vh - 64px) ;
  }

}
</style>
