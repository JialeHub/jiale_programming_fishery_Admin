<template>
  <div id="http" style="width: 100%;">
    <v-btn @click="get1">发送请求</v-btn>
    <v-file-input label="File input" v-model="file"/>
    <img :src="src" alt="">
    <a :href="href" download>{{msg}}</a>

    <div class="pro" style="padding-bottom: 20px;">
      <v-progress-linear :buffer-value="progress" stream color="primary" height="20">{{ progress }}%</v-progress-linear>
      <v-progress-circular :rotate="-90" :size="100" :width="15" :value="progress" color="primary" >
        {{ progress }}
      </v-progress-circular>
    </div>
  </div>
</template>

<script>
  import service from "@/api/axios/service";
  import qs from "qs";
  import axios from 'axios'

  export default {
    name: 'http',
    components: {},
    data() {
      return {
        msg: '/storage/file/20210127/wampserver3.2.3_x64.exe',
        href: '/storage/file/20210127/wampserver3.2.3_x64.exe',
        src: '',
        progress: 0,
        cancel: 0,
        file: null
      };
    },
    mounted() {
      // this.get1()
    },
    methods: {
      async get1() {
        this.cancel&&this.cancel();
        let params = {
          a:1,
          arr:[1,'2','a'],
          obj:{q:'q',w:'w'},
          mix1:[{a:1},[2],3],
          mix2:{a:1,b:[1],c:{a:1}},
        }
        let data = {
          a2:1,
          arr2:[1,'2','a'],
          obj2:{q:'q',w:'w'},
          mix12:[{a:1},[2],3],
          mix22:{a:1,b:[1],c:{a:1}},
          file : this.file,
          files : [this.file,this.file],
        }
        //`paramsSerializer` 是一个负责 `params` 序列化的函数
        //`transformRequest` 允许在向服务器发送前，修改data请求数据
        //get post delete put patch head options connect trace
        //`responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'

        let conf = {
          method: 'post',
          url: '/test',
          data,
          params,
          // responseType:'blob',
          //下载进度
          onDownloadProgress : (progressEvent)=>{
            this.progress = (progressEvent.loaded/progressEvent.total * 100).toFixed(2)
            console.log(progressEvent);
          },
          //上传进度
          onUploadProgress : (progressEvent)=>{
            this.progress = (progressEvent.loaded/progressEvent.total * 100).toFixed(2)
            console.log(progressEvent);
          },
          // 中断请求
          cancelToken: new axios.CancelToken((c)  => {
            // 存储一个cancel函数用于取消本次的网络请求
            this.cancel = c;
          }),
          transformRequest : data => {
          let formData = new FormData;
          qs.stringify(data,{encode:false,skipNulls:true}).split('&').forEach(item=>{
            let arr = item.split('=')
            formData.append(arr[0],arr[1])
          })
          //遍历data对象
          for (let k in data){
            //处理单文件
            if (data[k] instanceof File){
              formData.append(k,data[k])
            }else if (Array.isArray(data[k]) && data[k].length>0 &&(data[k][0] instanceof File)){
              //处理多文件
              data[k].forEach(item=>{
                formData.append(k+'[]',item)
              })
            }
          }
          return formData
        }

          // baseURL: '',
          // headers: {"Content-Type": "application/octet-stream"},
        }
        let res = await service(conf).then(res=> res).catch(err => err)
        console.log(res);
        // let url = 'data:image/png;base64,' + btoa(new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        // let url = window.URL.createObjectURL(res)
        // this.src = url
        // this.href = url
        // this.msg = url
      }
    }
  }
</script>

<style lang="scss">
  #http {
  }
</style>
