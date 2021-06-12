<template>
  <div id="online">
    online
    File:

    <v-file-input label="File input" outlined dense v-model="file"></v-file-input>
    <v-btn color="blue" @click="upload">上传</v-btn>
    <br>
    Publish:
    <v-form ref="form" lazy-validation >
      <v-text-field v-model="form.title"  label="title"  ></v-text-field>
      <v-text-field v-model="form.content"  label="content"  ></v-text-field>
      <v-text-field v-model="form.location"  label="location"  ></v-text-field>
      <v-text-field v-model="form.fileIds"  label="文件ID" disabled></v-text-field>
    </v-form>
    <v-btn color="blue" @click="postForm">发布</v-btn>
    <div>
      {{msg}}
    </div>
  </div>
</template>

<script>

  import {postPublishApi, uploadApi} from "@/api/modules";

  export default {
    name: 'online',
    components: {},
    data() {
      return {
        msg: '',
        form:{
          title:'测试标题',
          content:'测试内容',
          location:'116.123,165.156',
          fileIds:'',
        },
        file:{},
      };
    },
    methods: {
      upload(){
        console.log(this.file);
        let data = new FormData;
        data.append('file',this.file)
        uploadApi(data).then(response => {
          this.form.fileIds=response['res'][0]['id']
          this.msg = response;
        }).catch(error => {
          console.log(error);
        })
      },
      postForm(){
        let data ={
          ...this.form
        }
        postPublishApi(data).then(response => {
          console.log(response);
          this.msg = response;
        }).catch(error => {
          console.log(error);
        })
      }
    }
  }
</script>

<style lang="scss">
  #online {
  }
</style>
