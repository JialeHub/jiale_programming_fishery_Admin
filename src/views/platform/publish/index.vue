<template>
  <div id="publish">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-text-field label="标题" hint="标题" style="flex: 0 1 200px"  dense
                      v-model="searchOption.title" clearable outlined hide-details
        ></v-text-field>

        <v-menu v-model="FilterMenuCreateTime" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="发布时间" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption.createTime" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker range v-model="searchOption.createTime" clearable></v-date-picker>
        </v-menu>

        <v-menu v-model="FilterMenuUpdateTime" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="评价时间" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption.updateTime" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker range v-model="searchOption.updateTime" clearable></v-date-picker>
        </v-menu>

        <v-text-field label="发布者" hint="发布者" style="flex: 0 1 200px" outlined dense hide-details
                      v-model="searchOption['createUser.username']" clearable
        ></v-text-field>

        <v-select style="flex: 0 1 200px" outlined dense :menu-props="{ offsetY: true }"
                  :items="[{text:'停用',value:'0'},{text:'公开',value:'1'},{text:'私密',value:'2'}]" v-model="searchOption.status" clearable
                  label="选择状态" hint="状态" hide-details
        ></v-select>

        <v-select style="flex: 0 1 200px" outlined dense :menu-props="{ offsetY: true }"
                  :items="[{text:'本船',value:'0'},{text:'其他渔船',value:'1'}]" v-model="searchOption.type" clearable
                  label="选择类型" hint="类型" hide-details
        ></v-select>

        <div class="mr-3" style="width: 250px">
          <v-range-slider hide-details max="4" min="-1" dense v-model="searchOption.scoreRange"  label="分数范围：">
            <template v-slot:thumb-label="props">{{props.value===-1?'无':props.value}}</template>
          </v-range-slider>
        </div>

        <v-btn depressed color="success" @click="search">
          <v-icon left>mdi-magnify</v-icon>
          搜索
        </v-btn>
        <v-btn depressed color="warning" @click="commitOption({})">
          <v-icon left>mdi-rotate-3d-variant</v-icon>
          重置
        </v-btn>
      </div>
      <!--操作栏-->
      <v-row>
        <v-col cols="auto">
          <div class="batchOperationBtn">
            <v-btn depressed disabled color="primary" small @click="openFormDialog()" v-if="false">
              <v-icon left small>mdi-plus</v-icon>
              新增
            </v-btn>
            <v-btn depressed color="success" small :href="$addBaseURL(`/publish/downloadFiles?ids=`+selected.map(item=>item.id).join(','))" target="_blank">
              <v-icon left small>mdi-download</v-icon>
              批量下载图片
            </v-btn>
            <v-btn depressed color="warning" small :href="$addBaseURL(`/publish/export`)" target="_blank">
              <v-icon left small>mdi-download</v-icon>
              全部导出
            </v-btn>
            <v-btn depressed color="error" small @click="deleteItem()" :disabled="!$notEmpty(selected)">
              <v-icon left small>mdi-delete</v-icon>
              批量删除
            </v-btn>
          </div>
        </v-col>
        <v-spacer/>
        <v-col cols="auto">
          <div class="groupOperationBtn">
            <v-btn depressed tile small @click="filterToolbar=!filterToolbar" title="搜索栏"
                   :class="filterToolbar?['v-btn--active']:[]">
              <v-icon small>mdi-magnify</v-icon>
            </v-btn>
            <v-btn depressed tile small @click="fetchData" title="刷新表格">
              <v-icon small>mdi-refresh</v-icon>
            </v-btn>
            <v-menu offset-y :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn depressed tile small v-bind="attrs" v-on="on" title="表头显示">
                  <v-icon small>mdi-table-headers-eye</v-icon>
                </v-btn>
              </template>
              <v-list dense class="groupOperationMenu">
                <v-checkbox :ripple="false" v-model="headersShow" :label="item.text" :value="index" multiple
                            v-for="(item, index) in headers" :key="index" hide-details dense></v-checkbox>
              </v-list>
            </v-menu>
          </div>
        </v-col>
      </v-row>

      <!--   数据列表   -->
      <v-data-table elevation="1" class="publishTable dataTable" fixed-header multi-sort show-select
                    :server-items-length="count" show-expand
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:top>
          <!--   编辑、新增对话框   -->
          <v-dialog v-model="formDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ $notEmpty(form.id) ? '评价' : '新增数据' }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form :disabled="loadingSubmit">
                    <v-row no-gutters>

                      <v-col cols="12" style="display: flex;justify-content: space-between;margin-bottom: 10px;">
                        <v-rating size="26" v-model="form.score" background-color="orange lighten-3" color="orange"
                                  length="4"/>
                        <v-btn color="orange lighten-1" text @click="form.score=0"> 归零</v-btn>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea v-model="form.evaluate" label="回复内容" counter maxlength="100"
                                    outlined></v-textarea>
                      </v-col>

                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeFormDialog" :disabled="loadingSubmit">关闭</v-btn>
                <v-btn color="blue darken-1" text @click="submitForm " :loading="loadingSubmit">保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!--   删除对话框   -->
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">{{ batchDelete ? '确认批量删除吗？' : '确认删除吗？' }}</v-card-title>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                <v-btn color="error" type="" text @click="deleteItemConfirm">确定</v-btn>
                <v-spacer/>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:[`item.createUser.avatar`]="{ item }">
          <v-avatar size="36">
            <img v-if="$notEmpty(item['createUser']) && $notEmpty(item['createUser']['avatar'])" :src="$addBaseURL(item.createUser['avatar'])">
            <div class="" v-else>无</div>
          </v-avatar>
        </template>
        <template v-slot:[`item.createUser.username`]="{ item }">
          <span v-if="$notEmpty(item['createUser'])">{{item.createUser['username']}}</span>
        </template>
        <template v-slot:[`item.updateUser.username`]="{ item }">
          <span v-if="$notEmpty(item['createUser'])">{{item.updateUser['username']}}</span>
        </template>
        <template v-slot:[`item.fileLength`]="{ item }">
          <span v-if="$notEmpty(item['file'])">{{item.file['length']}}</span>
          <span v-else>0</span>
        </template>
        <template v-slot:[`item.score`]="{ item }">
          {{item.score===-1?'未评分':item.score}}
        </template>
        <template v-slot:[`item.type`]="{ item }">
          {{item.type===1?'其他渔船渔获':'本船渔获'}}
        </template>
        <template v-slot:[`item.operatingType`]="{ item }">
          {{selectorType[item.operatingType]}}
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="" style="padding: 10px;width: 100%;display: flex;flex-direction: column">
              <!--<div class="title" style="width: 100%" v-if="$notEmpty(item['title'])"><span>作业天数:</span><span> {{item['title']}}</span>
            </div>
            <div class="title" style="width: 100%" v-if="$notEmpty(item['content'])"><span>卖鱼单船号:</span><span> {{item['content']}}</span>
            </div>-->
              <div class="title" style="width: 100%" v-if="$notEmpty(item['evaluate'])"><span>回复:</span><span> {{item['evaluate']}}</span>
              </div>
              <div class="ip" style="width: 100%" v-if="$notEmpty(item['ip'])">
                <span>IP:</span><span> {{item['ip']}}</span></div>
              <div class="ipInfo" style="width: 100%" v-if="$notEmpty(item['ipInfo'])"><span>IP位置:</span><span> {{item.ipInfo['addr']}}</span>
              </div>
              <div class="locationResAddr" style="width: 100%" v-if="$notEmpty(item['locationResAddr'])"><span>GPS位置:</span>
                <span v-if="$notEmpty(item['locationResAddr'])">
                {{item['locationResAddr']}}
              </span>
              </div>
              <div class="title" style="width: 100%">
                <v-row v-if="$notEmpty(item['file'])" style="width: 100%">
                  <v-col cols="4" v-for="item2 in item['file']" :key="item2.id"
                         style="font-weight: normal;font-size: 14px;line-height: 1.45;width: 100%;">
                    <div class=""
                         style="background-color: rgba(220,230,240,0.33);position: relative;width: 100%;max-width: 500px">
                      <v-img width="100%" height="auto" :src="$addBaseURL(item2['path'])"
                             @click="openImg($addBaseURL(item2['path']))" style="cursor: pointer"/>
                      <div v-if="$notEmpty(item2['name'])" style="width: 100%"><span>文件名:{{item2['name']}}</span></div>
                      <div v-if="$notEmpty(item2['size'])" style="width: 100%">
                        <span>文件大小:{{$sizeToStr(item2['size'])}}</span></div>
                      <div v-if="$notEmpty(item2['info']) && $notEmpty(item2['info']['imgInfo']) " style="width: 100%">
                        <div v-if="$notEmpty(item2['info']['imgInfo']['GPSLongitudeD'])"><span>经度:{{item2['info']['imgInfo']['GPSLongitudeD']}}</span>
                        </div>
                        <div v-if="$notEmpty(item2['info']['imgInfo']['GPSLatitudeD'])"><span>纬度:{{item2['info']['imgInfo']['GPSLatitudeD']}}</span>
                        </div>
                        <div v-if="$notEmpty(item2['info']['imgInfo']['FileDateTime'])"><span>拍摄时间:{{$formatDate(item2['info']['imgInfo']['FileDateTime']*1000)}}</span>
                        </div>
                        <div v-if="$notEmpty(item2['info']['imgInfo']['Model'])"><span>拍摄设备:{{item2['info']['imgInfo']['Model'] }}</span>
                        </div>
                        <div v-if="$notEmpty(item2['info']['imgInfo']['COMPUTED'])">
                          <div v-if="$notEmpty(item2['info']['imgInfo']['COMPUTED']['Width'])"><span>宽度:{{item2['info']['imgInfo']['COMPUTED']['Width']}}px</span>
                          </div>
                          <div v-if="$notEmpty(item2['info']['imgInfo']['COMPUTED']['Height'])"><span>高度:{{item2['info']['imgInfo']['COMPUTED']['Height']}}px</span>
                          </div>
                        </div>
                      </div>
                      <div style="display: flex;justify-content: flex-end;position: absolute;bottom: 0;right: 0;">
                        <v-btn color="success" small right @click="downloadPicture(item2,item)">下载文件
                          <v-icon right dark>mdi-cloud-download</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>
          </td>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip color="warning" v-if="item.status===2" small label>私密</v-chip>
          <v-chip color="success" v-if="item.status===1" small label>公开</v-chip>
          <v-chip color="error" v-else-if="item.status===0" small label>停用</v-chip>
        </template>
        <template v-slot:[`item.allowAction`]="{ item }">
          <v-btn small icon class="mr-2" @click="openFormDialog(item)" title="编辑" color="warning" :loading="(readLoading && info.id===item.id)">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn small icon class="mr-2" :href="$addBaseURL(`/publish/downloadFiles?id=`+item.id)" target="_blank" title="下载图片" color="success">
            <v-icon size="20">mdi-download</v-icon>
          </v-btn>
          <v-btn small icon @click="deleteItem(item)" title="删除用户" color="error">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:no-data>暂无数据</template>
      </v-data-table>

    </v-sheet>
  </div>
</template>

<script>
import qs from "qs";
import {
  addPublishApi,
  delPublishApi,
  editPublishApi,
  readPublishApi,
  publishListApi,
  downloadFileApi
} from "@/api/modules";
import {TpSqlBuilder} from "@/utils/tp-sql";
import {axiosL} from "@/api/axios";

export default {
  name: 'publish',
  data() {
    return {
      title:'照片记录',
      info: {},
      headers: [
        {text: 'ID', value: 'id',initHide:true, class: 'minWidth80'},
        {text: '发布者', value: 'createUser.username', class: 'minWidth80'},
        {text: '头像', value: 'createUser.avatar', class: 'minWidth60'},

        {text: '类型', value: 'type',initHide:false, class: 'minWidth90'},
        {text: '状态', value: 'status',initHide:false, class: 'minWidth90'},
        {text: '标题', value: 'title',initHide:false, class: 'minWidth110'},
        {text: '作业天数', value: 'workDays',initHide:false, class: 'minWidth110'},
        {text: '船号', value: 'fishingBoats',initHide:false, class: 'minWidth80'},
        {text: '作业类型', value: 'operatingType',initHide:false, class: 'minWidth100'},
        {text: '主机功率(千瓦)', value: 'machinePower',initHide:false, class: 'minWidth140'},
        {text: '图片数量', value: 'fileLength',initHide:false, class: 'minWidth100'},
        {text: 'GPS经纬度', value: 'location',initHide:true, class: 'minWidth80'},
        {text: '分数', value: 'score',initHide:false,class:'minWidth80'},
        {text: 'GPS地址', value: 'locationResAddr',initHide:true,class:'minWidth150'},
        {text: 'IP', value: 'ip',initHide:true,class:'minWidth80'},
        {text: 'IP位置', value: 'ipAddr',initHide:true,class:'minWidth150'},

        {text: '发布时间', value: 'createTime', class: 'minWidth110'},
        {text: '评价时间', value: 'updateTime', initHide: true, class: 'minWidth110'},
        {text: '评价者', value: 'updateUser.username', initHide: true, class: 'minWidth80'},
        {text: '操作', value: 'allowAction', sortable: false, align: 'center', class: 'minWidth150'},
      ],
      FilterMenuCreateTime: false,
      FilterMenuUpdateTime: false,
      dialogDelete: false,
      batchDelete: false,
      filterToolbar: true,
      loading: false,
      loadingSubmit: false,
      readLoading: false,
      count: 0,
      list: [],
      selected: [],
      headersShow: [],
      formDialog: false,
      form: {
        id: null,
        score: '',
        evaluate: '',
      },
      tableOptions: {},
      selectorType: ['单拖','双拖','拖虾','围网','罩网','刺网','钓具','笼壶','张网','杂渔具','潜捕','拖贝'],
      searchOption: {
        title: '',
        content: '',
        status: null,
        type: null,
        createTime: [],
        updateTime: [],
        scoreRange: [-1, 4],
        'createUser.username': ''
      },
      searchSqlType: {
        equal: ['status','type',],/* 精确查询 */
        strLike: ['title', 'content', 'createUser.username'],/* 模糊查询 */
        dateBetween: ['createTime','updateTime',],/* 日期范围查询 */
        sectionBetween: ['scoreRange']/* 区间范围查询 */
      },
    }
  },
  created() {
    let headersShow = []
    for (let k in this.headers) {
      if (this.headers[k]['initHide'] !== true) headersShow.push(parseInt(k))
    }
    this.headersShow = headersShow;
  },
  computed: {
    headersCurrent() {
      return [...this.headersShow].sort((a, b) => a - b).map(item => this.headers[item])
    },
    /* 与路由单向同步，只读 */
    optionRouteROM() {
      return qs.parse(this.$route.query.option);
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.initOptions();
        this.fetchData();
      },
      immediate: true,
      deep: true
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  methods: {
    async downloadFile(item) {
      if (this.$notEmpty(item)) {
        //单个记录下载
        let res = await downloadFileApi(item.id).then(res => res).catch(err => err)
        if (res.status === 200) window.open(this.$addBaseURL(res.path))
      }
    },
    downloadPicture(item2, item) {
      // let username = item.createUser ? item.createUser.username : ''
      let realname = item.createUser ? item.createUser.realname : ''
      let createTime = item.createTime.replace(/:/g, '-').replace(" ", '_')
      let machinePower = item.machinePower
      let selectorType = ['单拖', '双拖', '拖虾', '围网', '罩网', '刺网', '钓具', '笼壶', '张网', '杂渔具', '潜捕', '拖贝'];
      let operatingType = selectorType[item.operatingType]
      let fishingBoats = item.fishingBoats
      let location = item.location.replace(".","D")
      let type = item.type === 1 ? '_QT' : ''
      axiosL(item2['path'], undefined, `${realname + type + '_' + fishingBoats + '_' + operatingType + '_' + machinePower + '_' + createTime + '_' + location + '_' + item['id'] + '_' + item2['id'] + '.' + item2['suffix']}`).then(res => res).catch(err => err)
    },
    openImg(url) {
      window.open(url)
    },
    /* 初始化数据表选项 */
    initOptions() {
      let option = {searchOption: {}, ...this.optionRouteROM};
      // 初始化筛选输入框
      for (let k in this.searchOption) {
        this.searchOption[k] = (option.searchOption && this.$notEmpty(option.searchOption[k])) ? option.searchOption[k] : this.$options.data().searchOption[k]
      }

      // 初始化排序
      this.tableOptions.page = this.$notEmpty(option.page) ? parseInt(option.page) : 1
      this.tableOptions.itemsPerPage = this.$notEmpty(option.itemsPerPage) ? parseInt(option.itemsPerPage) : 20
      this.tableOptions.sortBy = this.$notEmpty(option.sortBy) ? option.sortBy : []
      this.tableOptions.sortDesc = this.$notEmpty(option.sortDesc) ? option.sortDesc.map(item => item === 'true') : []
    },
    /* 提交到路由 */
    commitOption(option) {
      let queryOption = this.$notEmpty(this.$route.query.option) ? this.$route.query.option : '';
      let qsOption = qs.stringify(option, {strictNullHandling: true,skipNulls:true});
      if (queryOption !== qsOption) {
        this.$router.push({query: this.$notEmpty(qsOption) ? {option: qsOption} : {}});
      } else if (!this.loading) {
        this.fetchData();
      }
    },
    /* 表格选项变化【页数、排序】 */
    optionsChange(v) {
      this.commitOption({
        ...this.optionRouteROM,
        page: v.page,
        itemsPerPage: v.itemsPerPage,
        sortBy: v.sortBy,
        sortDesc: v.sortDesc
      });
    },
    /* 开始搜索 */
    search() {
      let searchOption = {...this.searchOption}
      for (let k in searchOption) {
        if (typeof (searchOption[k]) == 'string') searchOption[k] = searchOption[k].trim();
        if (!this.$notEmpty(searchOption[k])) searchOption[k] = null;
      }
      let option = {...this.optionRouteROM, searchOption};
      this.commitOption(option);
    },
    /* 获取数据 */
    async fetchData() {
      /* Vuetify => tp6 */
      let option = {...this.optionRouteROM}

      // 处理搜索筛选
      let searchOption = this.$notEmpty(this.optionRouteROM.searchOption) ? this.optionRouteROM.searchOption : {};
      let searchList = new TpSqlBuilder(this.searchSqlType, searchOption)

      // 处理排序
      let sortList = [];
      if (this.$notEmpty(option.sortBy)) {
        option.sortBy.forEach((item, index) => {
          let obj = {};
          obj[item] = option.sortDesc[index] === 'true' ? 'desc' : 'asc'
          sortList.push(obj)
        })
      }

      let data = {
        page: option.page,
        limit: option.itemsPerPage,
        searchList,
        sortList
      }
      this.loading = true
      let res = await publishListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        let list = [...res.list]
        this.count = res.count
        this.list = list
        this.selected = []
      }
    },
    /* 获取指定ID数据 */
    async readData(item) {
      if (this.readLoading) return ;
      let data = {id: item.id}
      this.info = item
      this.readLoading = true
      let res = await readPublishApi(data).catch(err => err)
      this.readLoading = false
      this.info = res.info
      return res;
    },
    /* ******************删除数据****************** */
    deleteItem(item = null) {
      this.batchDelete = !this.$notEmpty(item)
      if (!this.batchDelete) {
        this.editedIndex = item['id']
        this.editedItem = Object.assign({}, item)
      }
      this.dialogDelete = true
    },
    closeDelete() {
      let batch = this.batchDelete
      this.dialogDelete = false
      if (!batch) {
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      }
    },
    async deleteItemConfirm() {
      let batch = this.batchDelete
      this.loading = true;
      let data = batch ? {
        ids: this.selected.map(item => item.id),
      } : {
        id: this.editedIndex
      }
      let res = await delPublishApi(data).then(res => res).catch(err => err).finally(() => {
        this.formLoading = false;
        this.fetchData();
      })
      if (this.$notEmpty(res['msg']) && this.$notEmpty(res['status']) && res['status'] === 200) {
        await this.$store.dispatch('setMsg', {show: true, color: 'green', timeout: 5000, text: res['msg']})
        this.selected = []
      } else if (this.$notEmpty(res['msg'])) {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: res['msg']})
      } else {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: '发生未知错误'})
      }
      this.closeDelete()
    },
    /* ******************删除数据****************** */
    /* ******************新增、修改数据****************** */
    async openFormDialog(item) {
      if (this.$notEmpty(item) && this.$notEmpty(item['id'])) {
        let res = await this.readData(item)
        this.$objectEvaluate(this.form, res.info)
      }
      this.formDialog = true
    },
    closeFormDialog() {
      this.formDialog = false
      this.$nextTick(() => {
        this.form = this.$options.data().form
      })
    },
    async submitForm() {
      let data = {...this.form}
      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editPublishApi : addPublishApi;
      let res = await submitFun(data).then(res => res).catch(err => err).finally(() => {
        this.loadingSubmit = false;
        this.fetchData();
      })
      if (this.$notEmpty(res['msg']) && this.$notEmpty(res['status']) && (res['status'] === 200 || res['status'] === 201)) {
        await this.$store.dispatch('setMsg', {show: true, color: 'green', timeout: 5000, text: res['msg']})
        this.selected = []
      } else if (this.$notEmpty(res['msg'])) {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: res['msg']})
      } else {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: '发生未知错误'})
      }
      this.closeFormDialog()
    },
    /* ******************新增、修改数据****************** */

  }
}
</script>

<style lang="scss">
#publish {
  height: 100%;

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .publishTable {
      flex: 0 1 auto;
      overflow: auto;
    }
  }

  .list-move {
    opacity: 0.1;
    transition: all 0.1s;
  }

  .list-enter-active, .list-leave-active {
    transition: all .15s;
  }

  .list-enter, .list-leave-to {
    opacity: 0;
    transform: translateY(-16px);
  }

  .menuDown {
    transition: 0.2s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  }

  .menuDownR {
    transform: rotate(-90deg);
    transition: 0.2s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  }
}

.minWidth60 {
  min-width: 60px;

}

.minWidth80 {
  min-width: 80px;
}

.minWidth90 {
  min-width: 90px;
}

.minWidth100 {
  min-width: 100px;
}

.minWidth110 {
  min-width: 110px;
}

.minWidth120 {
  min-width: 120px;
}


.minWidth130 {
  min-width: 130px;
}


.minWidth140 {
  min-width: 140px;
}

.minWidth150 {
  min-width: 150px;
}
</style>
