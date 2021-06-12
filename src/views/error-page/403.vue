<template>
  <div class="errPage-container">
    <v-btn dark class="pan-back-btn" @click="back" >
      返回
    </v-btn>
    <v-row>
      <v-col>
        <h1 class="text-jumbo text-ginormous">
          Oops!
        </h1><br>
        <h2>你没有权限去该页面</h2><br>
        <ul class="list-unstyled">
          <li>或者你可以去:</li>
          <li class="link-type">
            <router-link to="/">
              回首页
            </router-link>
          </li>
          <li><a href="#" @click.prevent="dialogVisible=true">点我看图</a></li>
        </ul>
      </v-col>
      <v-col>
        <img :src="ewizardClap" class="pan-img" v-if="dialogVisible">
        <img :src="errGif" v-else width="313" height="428" alt="Girl has dropped her ice cream.">
      </v-col>
    </v-row>
  </div>
</template>

<script>
import errGif from '@/assets/403_images/403.gif'

export default {
  name: 'Page403',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
      dialogVisible: false
    }
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/' })
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .errPage-container {
    width: 800px;
    max-width: 100%;
    margin: 100px auto;
    .pan-back-btn {
      background: #008489;
      color: #fff;
      border: none!important;
    }
    .pan-gif {
      margin: 0 auto;
      display: block;
    }
    .pan-img {
      display: block;
      margin: 0 auto;
      width: 100%;
    }
    .text-jumbo {
      font-size: 60px;
      font-weight: 700;
      color: #484848;
    }
    .list-unstyled {
      font-size: 14px;
      li {
        padding-bottom: 5px;
      }
      a {
        color: #008489;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
