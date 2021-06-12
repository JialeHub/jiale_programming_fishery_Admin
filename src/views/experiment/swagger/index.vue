<template>
  <div id="home">
    <iframe class="iframe" :src="$addBaseURL('/swagger')" frameborder="0"></iframe>
  </div>
</template>

<script>
export default {
  name: 'Swagger',
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
