<template>
  <v-container fluid class="loginContainer">
    <!--Logo-->
    <v-row no-gutters class="loginRow" justify="center">
      <h1>
        <router-link to="/login" class="logoLink">LE后台管理系统</router-link>
      </h1>
    </v-row>
    <!--提示框-->
    <v-row no-gutters v-if="$notEmpty(alertObj)">
      <v-alert :type="alertObj.type" border="left" colored-border :color="`${alertObj.color} accent-4`"
               class="alertSheet w100" transition="slide-y-transition" v-model="alertFlag"
               :dismissible="alertObj.closeIcon!==false">
        <div v-for="(item,index) in alertObj.msg" :key="index">
          <strong v-if="$notEmpty(item.strong)">{{item.strong}}</strong>
          <span v-if="$notEmpty(item.text)">{{item.text}}</span>
          <router-link :to="item.link" class="underLink link0" v-if="$notEmpty(item.linkText)">{{item.linkText}}
          </router-link>
        </div>
      </v-alert>
    </v-row>
    <!--登录注册框-->
    <v-row no-gutters>
      <v-sheet class="loginSheet w100" elevation="2">
        <transition name="fade" mode="out-in">
          <!--登录-->
          <v-form ref="loginForm" key="loginForm" v-model="formRules.formValid" :lazy-validation="true"
                  v-if="model===0">
            <v-text-field v-model="form.username" label="用户名或电子邮件地址" required error-count="0" ref="username"
                          @keyup.enter.native="passFocus"
                          :rules="formRules.usernameRules"></v-text-field>
            <v-text-field v-model="form.password" label="密码" required :rules="formRules.passRules" error-count="0"
                          :type="form.showPass ? 'text' : 'password'" ref="password"
                          :append-icon="form.showPass ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="form.showPass = !form.showPass"
                          @keyup.enter.native="phraseFocus"
            ></v-text-field>
            <v-text-field v-model="form.phrase" label="验证码" required error-count="0" ref="phrase"
                          @keyup.enter.native="submit" :rules="formRules.phraseRules" class="phraseInput">
              <template slot="append" >
                <div class="img" style="width: 110px;height: 40px;">
                  <v-img :src="captchaSrc"  alt="验证码" @click="getLoginCaptcha" style="cursor: pointer"/>
                </div>
              </template>
            </v-text-field>
            <v-row no-gutters justify="space-between" align="center">
              <v-checkbox v-model="form.rememberMe" label="记住我的登录信息" :ripple="false"
                          :disabled="!cookieEnabled"></v-checkbox>
              <v-btn depressed color="primary" @click="submit" :loading="loginLoading">登录</v-btn>
            </v-row>
          </v-form>
          <!--重置密码-->
          <div style="width: 100%;" v-if="model===1" key="forgetForm">
            <v-tabs-items v-model="forgetStep">
              <v-tab-item :value="0" >
                <v-form ref="forgetForm0" v-model="formForget0Rules.formValid" :lazy-validation="true"
                        @submit.native.prevent="">
                  <v-text-field v-model="formForget0.username" label="用户名或电子邮件地址" required error-count="0"
                                ref="usernameForget" @keyup.enter.native="forgetNext" :disabled="forgetStep===1"
                                :rules="formForget0Rules.usernameRules"></v-text-field>
                </v-form>
              </v-tab-item>
              <v-tab-item :value="1">
                <v-form ref="forgetForm1" v-model="formForget1Rules.formValid" :lazy-validation="true"
                        @submit.native.prevent="">
                  <v-text-field v-model="formForget0.username" label="用户名或电子邮件地址" error-count="0" disabled/>
                  <v-text-field v-model="formForget1.code" label="验证码" required error-count="0" ref="codeForget"
                                @keyup.enter.native="forgetNext"
                                :rules="formForget1Rules.codeRules"/>
                </v-form>
              </v-tab-item>
              <v-tab-item :value="2">
                <v-form ref="forgetForm2" v-model="formForget2Rules.formValid" :lazy-validation="true"
                        @submit.native.prevent="">
                  <v-text-field v-model="formForget0.username" label="用户名或电子邮件地址" error-count="0" disabled/>
                  <v-text-field v-model="formForget2.password" label="新密码" required :rules="formForget2Rules.passRules"
                                error-count="0" :type="formForget2.showPass ? 'text' : 'password'" ref="passwordForget"
                                :append-icon="formForget2.showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="formForget2.showPass = !formForget2.showPass"
                                @keyup.enter.native="forgetNext"
                  ></v-text-field>
                </v-form>
              </v-tab-item>
            </v-tabs-items>
            <v-row no-gutters align="center" style="margin-top: 10px;">
              <v-btn depressed text color="primary" @click="reSendForgetEmail" :loading="reSendLoading" :disabled="forgetNextLoading" v-if="forgetStep===1"  >
                重新发送
              </v-btn>
              <v-spacer/>
              <v-btn depressed color="primary" @click="forgetNext" :loading="forgetNextLoading" :disabled="reSendLoading">
                {{forgetStep===2?"重置":"下一步"}}
              </v-btn>
            </v-row>
          </div>
        </transition>
      </v-sheet>
    </v-row>

    <!--其他链接-->
    <v-row no-gutters>
      <div class="navDiv">
        <transition name="fade" mode="out-in">
          <p class="nav" key="nav1" v-if="model===1" style="display: flex;">
            <v-spacer/>
            <router-link to="/login" @click.native="changeLogin" class="otherLink ">去登录 →</router-link>
          </p>
          <p class="nav" key="nav2" v-if="model===0" style="display: flex;">
            <router-link to="/" class="otherLink ">← 返回站点</router-link>
            <v-spacer/>
            <router-link to="/login?status=forgetPass" class="otherLink ">重置密码</router-link>
          </p>
        </transition>
      </div>
    </v-row>
  </v-container>
</template>

<script>

  import Cookies from "js-cookie"
  import settings from "@/settings";
  import {login} from "@/utils/auth";
  import {notEmpty} from "@/utils/globalMethod";
  import {
    getForgetPassTokenApi,
    getLoginCaptchaApi,
    sendForgetEmailApi,
    updatePassBySessionTokenApi
  } from "@/api/modules";
  import {RSAEncrypt} from "@/utils/cryptology";

  export default {
    name: 'ContainerLogin',
    data() {
      return {
        model: 0, //0登录 1重置密码
        forgetStep: 0, //0发送邮件 1输入验证码 2输入新密码
        redirect: undefined,
        otherQuery: {},
        alertObj: {},
        cookieEnabled: true,
        alertFlag: false,
        loginLoading: false,
        forgetNextLoading: false,
        reSendLoading: false,
        formRules: {
          autoValid: true,
          formValid: true,
          usernameRules: [v => this.formRules.autoValid || !!v || '用户名不能为空。'],
          passRules: [v => this.formRules.autoValid || !!v || '密码不能为空。'],
          phraseRules: [v => this.formRules.autoValid || !!v || '验证码不能为空。'],
        },
        formForget0Rules: {
          autoValid: true,
          formValid: true,
          usernameRules: [v => this.formForget0Rules.autoValid || !!v || '用户名或邮箱不能为空。'],
        },
        formForget1Rules: {
          autoValid: true,
          formValid: true,
          codeRules: [v => this.formForget1Rules.autoValid || !!v || '验证码不能为空。'],
        },
        formForget2Rules: {
          autoValid: true,
          formValid: true,
          passRules: [v => this.formForget2Rules.autoValid || !!v || '密码不能为空。'],
        },
        formForget0: {
          username: '',
        },
        formForget1: {
          code: '',
        },
        formForget2: {
          password: '',
          token: '',
          showPass: false
        },
        captchaSrc:'',
        captchaLoading:false,
        form: {
          username: '',
          password: '',
          uuid: '',
          phrase: '',
          app: 'admin',
          rememberMe: false,
          showPass: false
        }
      };
    },
    mounted() {
      this.init();
      this.form.username = this.$storeGet.username;
      this.form.rememberMe = this.$storeGet.rememberMe;
      if (this.form.username === '' && this.mode === 0) {
        this.$refs.username.focus()
      } else if (this.form.password === '' && this.mode === 0) {
        this.$refs.password.focus()
      }
      this.getLoginCaptcha();
    },
    props: {
      comStatus: { // 组件状态
        type: String,
        default: ''
      },
    },
    beforeDestroy() {
      this.$emit('close-login-dialog')
    },
    methods: {
      async getLoginCaptcha(){
        if (this.captchaLoading) return

        this.captchaLoading = true
        this.captchaSrc='';
        let data = {lastUuid:this.form.uuid}
        let res = await getLoginCaptchaApi(data).then(res => res).catch(err => err)
        if (res.status===200){
          this.captchaSrc=res.img;
          this.form.uuid=res.uuid;
        }
        this.captchaLoading = false
      },
      clearForm() {
        this.form = {
          username: '',
          password: '',
          rememberMe: false,
          showPass: false
        }
        this.formForget0 = {
          username: '',
        }
        this.formForget1 = {
          code: '',
        }
        this.formForget2 = {
          password: '',
          token: '',
          showPass: false
        }
      },
      async reSendForgetEmail(){
        let res = await this.forgetStepApi('sendForgetEmailApi',true).catch(err=>err)
        if (res.status===200){
          this.alertShow('server', {
            color: 'info', closeIcon: false, msg: [{
              strong: "重置密码：",
              text: '验证码已重新发送至您的邮箱，请输入验证码以继续。',
            }]
          })
        }
      },
      forgetStepApi(apiName='',resendLoading=false){
        return new Promise((resolve, reject) => {
          if (!notEmpty(apiName)) new Error('函数名错误')
          if (resendLoading) this.reSendLoading=true;
          else this.forgetNextLoading=true
          ;(async ()=>{
            let getErrMsg = (err) =>{
              let serverError = notEmpty(err['data']);//判断是否为网络错误
              if (!serverError) console.error(err);//打印非网络错误
              let res = serverError ? err['data'] : {};
              res['errorType'] = 'error';
              return res
            }
            let res
            if (apiName==='sendForgetEmailApi') {
              res = await sendForgetEmailApi({username: this.formForget0.username}).then(res => res).catch(getErrMsg);
            }else if (apiName==='getForgetPassTokenApi') {
              res = await getForgetPassTokenApi({username: this.formForget0.username,code: this.formForget1.code}).then(res => res).catch(getErrMsg);
            }else if (apiName==='updatePassBySessionTokenApi') {
              res = await updatePassBySessionTokenApi({
                username: this.formForget0.username,
                token:this.formForget2.token,
                password: RSAEncrypt(this.formForget2.password)
              }).then(res => res).catch(getErrMsg);
            }

            if (resendLoading) this.reSendLoading=false;
            else this.forgetNextLoading=false;
            if (res.status===200) {
              resolve(res);
            }else if (notEmpty(res['msg'])) {
              this.alertShow('server', {color: res['errorType'] ? res['errorType'] : 'info', msg: [
                  ...this.alertObj.msg.filter(item => {if (item.strong === "重置密码：") return item}),{strong:'提示：',text: res['msg']}
                ]})
              reject(res)
            } else {
              this.alertShow('server', {color: 'error', type: 'error', msg: [
                  ...this.alertObj.msg.filter(item => {if (item.strong === "重置密码：") return item}),{strong:'错误：',text: '发生未知错误'}
                ]})
              reject(res)
            }
          })()
        })
      },
      async forgetNext() {
        this['formForget' + this.forgetStep + 'Rules'].autoValid = false
        if (this.$refs['forgetForm' + this.forgetStep].validate()) {
          let res
          switch (this.forgetStep) {
            case 0:
              res = await this.forgetStepApi('sendForgetEmailApi').catch(err=>err)
              if (res.status===200){
                this.forgetStep++;
                this.alertShow('server', {
                  color: 'success', closeIcon: false, msg: [{
                    strong: "重置密码：",
                    text: '验证码已发送至您的邮箱，请输入验证码以继续。',
                  }]
                })
                setTimeout(() => {
                  this.$refs.codeForget.focus()
                }, 0)
              }
              break;
            case 1:
              res = await this.forgetStepApi('getForgetPassTokenApi').catch(err=>err)
              if (res.status===200){
                this.formForget2.token=res.sessionToken
                this.forgetStep++;
                this.alertShow('server', {
                  color: 'success', closeIcon: false, msg: [{
                    strong: "重置密码：",
                    text: '邮箱验证成功，请输入新密码。',
                  }]
                })
                setTimeout(() => {
                  this.$refs.passwordForget.focus()
                }, 0)
              }
              break;
            case 2:
              res = await this.forgetStepApi('updatePassBySessionTokenApi').catch(err=>err)
              if (res.status===200){
                this.changeLogin(false, this.formForget0.username);
                this.alertShow('server', {
                  color: 'success', msg: [{text: '密码重置成功。',}]
                })
                this.clearForm()
              }
              break;
          }
        } else {
          this.alertShow('errorBucket')
        }
        this['formForget' + this.forgetStep + 'Rules'].autoValid = true
      },
      changeLogin(clearAlert = true, username = '') {
        this.getLoginCaptcha();
        this.clearForm()
        if (clearAlert) this.alertShow()
        this.form.username = username
        this.model = 0
        setTimeout(() => {
          if (this.form.username === '') {
            this.$refs.username.focus()
          } else if (this.form.password === '') {
            this.$refs.password.focus()
          }
        }, 250)
      },
      changeForget() {
        this.clearForm()
        this.forgetStep = 0
        setTimeout(() => {
          this.alertShow('server', {
            color: 'info', closeIcon: false, msg: [{
              text: '请输入您的用户名或电子邮箱地址。您会收到一条包含验证码的电子邮件。',
              strong: "重置密码：",
            }]
          })
        }, 220)
        this.model = 1
        setTimeout(() => {
          this.$refs.usernameForget.focus()
        }, 250)
      },
      passFocus() {
        this.$refs.password.focus()
      },
      phraseFocus() {
        this.$refs.phrase.focus()
      },
      getOtherQuery(query) {
        return Object.keys(query).reduce((acc, cur) => {
          if (cur !== 'redirect') {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
      },
      init() {
        Cookies.remove(`${settings.prefix}-TOKEN`);
        this.$resetStore();
        if (this.comStatus === 'expireLogin') this.$storeSet('setExpireLogin', true);
      },
      async submit() {
        this.formRules.autoValid = false
        if (this.$refs.loginForm.validate()) {
          this.loginLoading = true;
          //登录
          let data = {...this.form};
          let res = await login(data).catch(err => err);

          if (res.status === 200) {
            // 判断当前
            if (this.comStatus === 'expireLogin') {
              this.$emit('close-login-dialog')
              window.location.reload()
            } else {
              window.location.href = '/'
            }
            this.alertShow()
          } else if (res.status === 401.1) {
            this.alertShow('server', {
              type: 'error',
              color: 'error',
              msg: [{
                strong: '错误：',
                text: res['msg'] ? res['msg'] : '用户名或密码不正确。',
                linkText: '重置密码',
                link: '/login?status=forgetPass'
              }]
            })
          } else if (notEmpty(res['msg'])) {
            this.alertShow('server', {color: res['errorType'] ? res['errorType'] : 'info', msg: [{text: res['msg']}]})
          } else {
            this.alertShow('server', {color: 'error', type: 'error', msg: [{text: '发生未知错误'}]})
          }
          await this.getLoginCaptcha().catch(err=>err);
          this.loginLoading = false;
        } else {
          this.alertShow('errorBucket')
        }
        this.formRules.autoValid = true
      },
      resetValidation() {
        this.formRules.autoValid = true
        this.$nextTick(() => {
          if (this.model === 0) {
            this.$refs.loginForm.resetValidation()
          }
        })
      },
      alertShow(status, alertObj) {
        if (status === 'errorBucket') {
          // 表单验证错误
          let errorBucket;
          this.alertObj = {
            color: 'error',
            msg: [...this.alertObj.msg.filter(item => {
              if (item.strong === "重置密码：") return item
            })]
          }
          errorBucket = this.$refs[this.model === 1 ? ('forgetForm' + this.forgetStep) : 'loginForm'].inputs.map(item => item.errorBucket)
          errorBucket.forEach(item => {
            if (this.$notEmpty(item)) this.alertObj.msg.push({
              strong: '错误：', text: item.join(' ')
            })
          })
          this.alertFlag = true
        } else if (status === 'server') {
          // 服务器错误提示
          this.alertObj = alertObj
          this.alertFlag = true
        } else {
          this.alertFlag = false
          setTimeout(() => {
            this.alertObj = {}
          }, 500)
        }
      }
    },
    computed: {},
    watch: {
      '$query.status': {
        handler(status) {
          this.cookieEnabled = navigator.cookieEnabled;
          let alertObj = {msg: []}
          if (status === 'logout') {
            alertObj.type = 'info'
            alertObj.color = 'info'
            alertObj.msg.push({strong: '提示：', text: '您已注销。',})
          } else if (status === 'forgetPass') {
            this.changeForget()
          }
          this.resetValidation()

          if (!this.cookieEnabled) {
            delete alertObj.type
            alertObj.color = 'warning'
            alertObj.msg.push({strong: '警告：', text: 'Cookies已被禁用，为保证系统正常使用，请开启浏览器Cookies功能。'})
          }
          if (this.comStatus === 'expireLogin') {
            delete alertObj.type
            alertObj.color = 'warning'
            alertObj.closeIcon = false
            alertObj.msg.push({strong: '提示：', text: '会话已过期，请登录来继续您的工作。'})
          }
          if (alertObj.msg.length === 0) delete alertObj.msg;
          this.alertShow('server', alertObj)
        },
        deep: true,
        immediate: true
      },
      $route: {
        handler(route) {
          const query = route.query
          if (query) {
            this.redirect = query.redirect
            this.otherQuery = this.getOtherQuery(query)
          }
        },
        immediate: true
      }
    },
    components: {}
  }
</script>

<style lang="scss">
  .loginContainer {
    width: 320px;
    padding: 8% 0 0 0 !important;

    .fade-enter-active, .fade-leave-active {
      transition: opacity .2s;
    }

    .fade-enter, .fade-leave-to {
      opacity: 0;
    }

    .phraseInput{
      input{
        padding-bottom: 0;
      }
    }
    h1 {
      text-align: center;

      .logoLink {
        margin: 0 auto 25px;
        width: 84px;
        height: 84px;
        background-image: url("~@/assets/logo_tran.png");
        display: block;
        background-size: 84px;
        background-position: center top;
        background-repeat: no-repeat;
        text-indent: -9999px;
      }

    }

    .loginSheet {
      padding: 36px 24px 38px;
    }

    .navDiv {
      width: 100%;

      .nav {
        margin: 20px 0 0 0;
        padding: 0 20px 0;
        font-size: 14px;
        line-height: 1.5;
      }

      .nav:last-child {
        margin: 16px 0;
      }

      .otherLink {
        color: #555d66;
        cursor: pointer;
      }
    }
  }

  .theme--dark .loginContainer .navDiv .otherLink {
    color: rgba(255, 255, 255, 0.7);
  }
</style>
