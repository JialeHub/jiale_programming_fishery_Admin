<template>
  <div id="user">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-text-field label="用户账号" hint="用户账号" style="flex: 0 1 200px"  dense
                      v-model="searchOption.username" clearable outlined hide-details
                      ></v-text-field>
        <v-text-field label="用户昵称" hint="用户昵称" style="flex: 0 1 200px" outlined dense
                      v-model="searchOption.nickname" clearable hide-details
                      ></v-text-field>
        <v-text-field label="真实姓名" hint="真实姓名" style="flex: 0 1 200px" outlined dense
                      v-model="searchOption.realname" clearable hide-details
                      ></v-text-field>
        <v-text-field label="邮箱" hint="邮箱" style="flex: 0 1 200px" outlined dense
                      v-model="searchOption.email" clearable hide-details
                      ></v-text-field>
        <v-text-field label="手机" hint="手机" style="flex: 0 1 200px" outlined dense
                      v-model="searchOption.phone" clearable hide-details
                      ></v-text-field>

        <v-menu v-model="FilterMenuCreateTime" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="创建时间" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption.createTime" v-bind="attrs" v-on="on" clearable
                          />
          </template>
          <v-date-picker range v-model="searchOption.createTime" clearable></v-date-picker>
        </v-menu>


        <v-text-field label="创建者" hint="创建者" style="flex: 0 1 200px" outlined dense hide-details
                      v-model="searchOption['createUser.username']" clearable
                      ></v-text-field>

        <v-select style="flex: 0 1 200px" outlined dense :menu-props="{ offsetY: true }"
                  :items="[{text:'停用',value:'0'},{text:'启用',value:'1'}]" v-model="searchOption.status" clearable
                  label="选择状态" hint="状态" hide-details
        ></v-select>

        <v-combobox :loading="loadingTree" label="所属部门" hint="所属部门" hide-selected dense
                    item-text="name" item-value="id" clearable multiple style="flex: 0 1 290px"
                    @update:search-input="v=>listTreeSearchSearch=v" outlined
                    hide-details return-object v-model="searchOption['depts']" deletable-chips>
          <template v-slot:no-data>
            <v-treeview dense selectable selected-color="primary" hoverable :items="listTree"
                        return-object v-model="searchOption['depts']" selection-type="independent"
                        item-text="name" item-key="id" :search="listTreeSearchSearch"></v-treeview>
          </template>
        </v-combobox>

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
            <v-btn depressed color="primary" small @click="openFormDialog()">
              <v-icon left small>mdi-plus</v-icon>
              新增
            </v-btn>
            <v-btn depressed color="warning" small :href="$addBaseURL(`/user/export`)" target="_blank">
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
      <v-data-table elevation="1" class="userTable dataTable" fixed-header multi-sort show-select
                    :server-items-length="count"
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:top>
          <!--   编辑、新增对话框   -->
          <v-dialog v-model="formDialog" max-width="600px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ $notEmpty(form.id) ? '编辑用户' : '新增用户' }} · 快捷编辑模式</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form :disabled="loadingSubmit">
                    <v-row no-gutters>
                      <!--用户名-->
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="form.username" label="用户名" hide-details ></v-text-field>
                      </v-col><v-spacer/>
                      <!--邮箱-->
                      <v-col cols="12" sm="5">
                        <v-text-field v-model="form.email" label="邮箱" hide-details></v-text-field>
                      </v-col>
                      <!--电话-->
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="form.phone" label="电话" hide-details></v-text-field>
                      </v-col><v-spacer/>
                      <!--昵称-->
                      <v-col cols="12" sm="5">
                        <v-text-field v-model="form.nickname" label="昵称" hide-details></v-text-field>
                      </v-col>
                      <!--真实姓名-->
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="form.realname" label="真实姓名" hide-details></v-text-field>
                      </v-col><v-spacer/>
                      <!--性别-->
                      <v-col cols="12" sm="5">
                        <v-text-field v-model="form.gender" label="性别" hide-details></v-text-field>
                      </v-col>
                      <!--出生日期-->
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="form.birthday" label="出生日期" hide-details></v-text-field>
                      </v-col><v-spacer/>
                      <!--地址-->
                      <v-col cols="12" sm="5">
                        <v-text-field v-model="form.areaCode" label="地址" hide-details></v-text-field>
                      </v-col>
                      <!--链接-->
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="form.url" label="链接" hide-details></v-text-field>
                      </v-col><v-spacer/>
                      <!--介绍-->
                      <v-col cols="12" sm="5">
                        <v-text-field v-model="form.profile" label="介绍" hide-details></v-text-field>
                      </v-col>
                      <!--所属部门-->
                      <v-col cols="12" sm="6">
                        <v-combobox :loading="loadingTree" label="所属部门" hide-selected
                                    item-text="name" item-value="id" clearable multiple
                                    return-object @update:search-input="v=>listTreeSearch=v"
                                    hide-details v-model="form.depts" small-chips deletable-chips>
                          <template v-slot:no-data>
                            <v-treeview dense selectable selected-color="primary" hoverable :items="listTree"
                                        return-object v-model="form.depts" selection-type="independent"
                                        item-text="name" :search="listTreeSearch"></v-treeview>
                          </template>
                        </v-combobox>
                      </v-col><v-spacer/>
                      <!--角色-->
                      <v-col cols="12" sm="5">
                        <v-combobox :loading="loadingRoles" label="角色" hide-selected
                                    hide-details item-text="name" item-value="id" clearable
                                    multiple return-object :items="rolesList" small-chips deletable-chips
                                    v-model="form.roles">
                        </v-combobox>
                      </v-col>
                      <!--头像-->
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="form.avatar" label="头像" hide-details></v-text-field>
                      </v-col><v-spacer/>
                      <!--状态-->
                      <v-col cols="12" sm="5">
                        <v-switch color="primary" v-model="form.status" :label="`状态: ${form.status===1?'启用':'停用'}`"
                                  :false-value="0" :true-value="1"/>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeFormDialog" :disabled="loadingSubmit"> 关闭</v-btn>
                <v-btn color="blue darken-1" text @click="submitForm " :loading="loadingSubmit"> 保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!--   删除对话框   -->
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">{{ batchDelete ? '确认批量删除用户吗？' : '确认删除该用户吗？' }}</v-card-title>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                <v-btn color="error" type="" text @click="deleteItemConfirm">确定</v-btn>
                <v-spacer/>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:[`item.avatar`]="{ item }">
          <v-avatar size="36" v-if="$addBaseURL(item['avatar'])">
            <img :src="$addBaseURL(item['avatar'])" alt="无">
          </v-avatar>
          <div class="" v-else>无</div>
        </template>
        <template v-slot:[`item.depts`]="{ item }">
          <v-chip color="success" v-for="item2 in item.depts" :key="item2.id" small label class="ml-2">{{item2.name}}</v-chip>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip color="success" v-if="item.status===1" small label>启用</v-chip>
          <v-chip color="error" v-else-if="item.status===0" small label>停用</v-chip>
        </template>
        <template v-slot:[`item.allowAction`]="{ item }">
          <v-btn small icon class="mr-2" @click="openFormDialog(item)" title="编辑" color="warning" :loading="(readLoading && info.id===item.id)">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn small icon @click="deleteItem(item)" title="删除用户" color="error">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

    </v-sheet>
  </div>
</template>

<script>

import {
  addUserApi,
  delUserApi,
  deptListApi,
  editUserApi,
  readUserApi,
  roleListApi,
  userListApi
} from "@/api/modules";
import {RSAEncrypt} from "@/utils/cryptology";
import qs from "qs";
import {TpSqlBuilder} from "@/utils/tp-sql";

export default {
  name: 'user',
  data() {
    return {
      info: {},
      listTree: [],
      listTreeList: [],
      listTreeSearch:'',
      listTreeSearchSearch:'',
      headers: [
        {text: 'ID', value: 'id',initHide:false},
        {text: '账号', value: 'username',initHide:false},
        {text: '头像', value: 'avatar',initHide:false},
        {text: '部门', value: 'depts',initHide:false},
        {text: '用户昵称', value: 'nickname',initHide:false},
        {text: '姓名', value: 'realname',initHide:false},
        {text: '生日', value: 'birthday',initHide:true},
        {text: '邮箱', value: 'email',initHide:false},
        {text: '性别', value: 'gender',initHide:false},
        {text: '手机', value: 'phone',initHide:false},
        {text: '地址', value: 'areaCode',initHide:true},
        {text: '链接', value: 'url',initHide:true},
        {text: '介绍', value: 'profile',initHide:true},
        {text: '状态', value: 'status',initHide:false},
        {text: '创建时间', value: 'createTime'},
        {text: '创建者', value: 'createUser.username'},
        {text: '更新时间', value: 'updateTime', initHide: true},
        {text: '更新者', value: 'updateUser.username', initHide: true},
        {text: '操作', value: 'allowAction', sortable: false, align: 'center'},
      ],
      FilterMenuCreateTime: false,
      dialogDelete: false,
      batchDelete: false,
      filterToolbar: true,
      loading: false,
      loadingSubmit: false,
      readLoading: false,
      count: 0,
      list: [],
      rolesList: [],
      selected: [],
      headersShow: [],
      formDialog: false,
      loadingTree: false,
      loadingRoles: false,
      form: {
        id: null,
        depts: [],
        roles: [],
        username: '',
        email: '',
        phone: '',
        nickname: '',
        realname: '',
        birthday: null,
        gender: null,
        url: '',
        areaCode: '',
        avatar: '',
        profile: '',
        status: 1,
      },
      tableOptions: {},
      searchOption: {
        username: '',
        email: '',
        phone: '',
        nickname: '',
        realname: '',
        status: null,
        createTime: [],
        'depts': [],
        'createUser.username': ''
      },
      searchSqlType: {
        equal: ['status'],/* 精确查询 */
        inIdArr: ['depts'],/* IN查询 */
        strLike: ['username', 'email', 'phone', 'nickname', 'realname', 'createUser.username'],/* 模糊查询 */
        dateBetween: ['createTime'],/* 日期范围查询 */
      },
    }
  },
  created() {
    this.fetchDeptTree();
    this.fetchRoles();
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
    /* 初始化数据表选项 */
    initOptions() {
      let option = {searchOption: {}, ...this.optionRouteROM};
      // 初始化树模式
      if (this.$notEmpty(option.searchOption.treeMode)) option.searchOption.treeMode = option.searchOption.treeMode === 'true'
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
        if (k==='depts') searchOption[k] = this.$deepClone(searchOption[k],['id','name']);
      }
      let option = {...this.optionRouteROM, searchOption};
      this.commitOption(option);
    },
    /* 获取部门 */
    async fetchDeptTree() {
      let data = {
        tree: true,
      }
      this.loadingTree = true
      let res = await deptListApi(data).catch(err => err)
      this.loadingTree = false
      if (res.status === 200) {
        this.listTree = this.$deepClone([...res.list],['children','id','name'])
        this.listTreeList = this.$tree2list(this.listTree)
      }
    },
    /* 获取角色 */
    async fetchRoles() {
      this.loadingRoles = true
      let res = await roleListApi({limit:-1}).catch(err => err)
      this.loadingRoles = false
      if (res.status === 200) {
        this.rolesList = [...res.list]
      }
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
      let res = await userListApi(data).catch(err => err)
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
      let res = await readUserApi(data).catch(err => err)
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
      let res = await delUserApi(data).then(res => res).catch(err => err).finally(() => {
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
      if (this.$notEmpty(data['password'])) data['password'] = RSAEncrypt(data['password'])
      if (this.$notEmpty(data['depts'])) data['depts'] = data['depts'].map(item=>item['id'])
      if (this.$notEmpty(data['roles'])) data['roles'] = data['roles'].map(item=>item['id'])
      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editUserApi : addUserApi;
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
#user {
  height: 100%;

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .userTable {
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
</style>
