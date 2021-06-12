<template>
  <div id="server" style="position: relative">
    <div class="msg" style="width: 50%;position: absolute;color: rgba(255,255,255,0.9);font-size: 16px;z-index: 999;background-color: rgba(0,0,0,.5)">
      <div class="" style="font-size: 50px;color: red;float: right">
        {{this.msg2}}
      </div>
      {{this.msg}}
    </div>
    <v-img :src=" src"  style="width: 100vw;height: 100vh;max-height: 100vh;max-width: 100vw"></v-img>

  </div>
</template>

<script>

  import {getPublishApi} from "@/api/modules";

  export default {
    name: 'server',
    components: {},
    data() {
      return {
        msg:'',
        src:'https://picsum.photos/id/11/500/300',
      };
    },
    mounted() {
      setInterval(()=>{
        this.getPublish()
      },500)
    },
    methods: {
      getPublish(){
        let data = {
          current:1,
          limit:10,
          'sortList':[{'id':'desc'}],
          'searchList[]':[],
        }
        getPublishApi(data).then(response => {
          console.log(response);
          this.src = this.$addBaseURL(response['data']['list'][0]['file'][0]['path'])
          this.msg = response['data']['list'][0]['file'][0]['info']
          this.msg2 = response['data']['list'][0]['content']
        }).catch(error => {
          console.log(error);
        })
      }
    }
  }
</script>

<style lang="scss">
  #server {
  }
</style>
