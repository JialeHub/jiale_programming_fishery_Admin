<template>
  <div id="pluginDemo">

    <div class="vueCropper">
      <h2>图片裁剪插件 vueCropper</h2>
      <vueCropper
          style="width: 500px;height: 500px;border: 1px solid #000;"
          ref="cropper"
          :img="option.img"
          :outputSize="option.size"
          :outputType="option.outputType"
      ></vueCropper>
    </div>
    <hr>

    <div class="UploadComponent">
      <h2>图片上传插件 UploadComponent</h2>
<!--      <upload-component></upload-component>-->
    </div>
    <hr>

    <div class="VueCoreImageUpload">
      <h2>图片上传插件 VueCoreImageUpload</h2>
      <vue-core-image-upload
          :class="['btn', 'btn-primary']"
          :crop="false"
          @imageuploaded="imageuploaded"
          :data="data"
          :max-file-size="5242880"
          :url="$addBaseURL('./file/upload')" >
      </vue-core-image-upload>
    </div>
    <hr>

    <div class="simpleUploader">
      <h2>图片上传插件 simpleUploader</h2>
      <uploader :options="options2" class="uploader-example">
        <uploader-unsupport></uploader-unsupport>
        <uploader-drop>
          <p>Drop files here to upload or</p>
          <uploader-btn>select files</uploader-btn>
          <uploader-btn :attrs="attrs">select images</uploader-btn>
          <uploader-btn :directory="true">select folder</uploader-btn>
        </uploader-drop>
        <uploader-list></uploader-list>
      </uploader>
    </div>
    <hr>



  </div>
</template>

<script>
import { VueCropper }  from 'vue-cropper'
import VueCoreImageUpload  from 'vue-core-image-upload';
// import  UploadComponent   from './components/UploadComponent'

export default {
  name: 'pluginDemo',
  data() {
    return {
      data: null,
      option:{
        img:'https://img-blog.csdnimg.cn/img_convert/551ea7aa207d83e80535cff9762d5ae7.png',
        size:0,
        outputType:'',
      },
      options2: {
        // https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js
        target: this.$addBaseURL('./file/upload'),
        testChunks: false
      },
      attrs: {
        accept: 'image/*'
      }
    }
  },
  components: {
    VueCropper,
    'vue-core-image-upload': VueCoreImageUpload,
    VueCoreImageUpload,
    // UploadComponent,
  },
  mounted() {

  },
  methods: {
    imageuploaded(res) {
      if (res.errcode == 0) {
        this.src = 'http://img1.vued.vanthink.cn/vued751d13a9cb5376b89cb6719e86f591f3.png';
      }
    }
  }
}
</script>

<style lang="scss">
#pluginDemo {
  .uploader-example {
    width: 880px;
    padding: 15px;
    margin: 40px auto 0;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
  }
  .uploader-example .uploader-btn {
    margin-right: 4px;
  }
  .uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
