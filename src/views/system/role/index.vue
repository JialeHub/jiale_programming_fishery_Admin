<template>
  <div id="role">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-text-field label="角色名称" style="flex: 0 1 200px" solo hint="角色名称" dense
                      v-model="searchOption.name" clearable hide-details
                      placeholder="输入角色名称"></v-text-field>

        <v-menu v-model="FilterMenuCreateTime" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="创建时间" style="flex: 0 1 290px" solo dense readonly hide-details
                          v-model="searchOption.createTime" v-bind="attrs" v-on="on" clearable
                          placeholder="选择创建时间"/>
          </template>
          <v-date-picker range v-model="searchOption.createTime" clearable></v-date-picker>
        </v-menu>


        <v-text-field label="创建者" style="flex: 0 1 200px" solo hint="创建者" dense
                      v-model="searchOption['createUser.username']" clearable hide-details
                      placeholder="输入创建者"></v-text-field>

        <v-select style="flex: 0 1 200px" solo dense :menu-props="{ offsetY: true }" hide-details
                  :items="[{text:'停用',value:'0'},{text:'启用',value:'1'}]" v-model="searchOption.status" clearable
                  label="选择状态"
        ></v-select>


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
            <v-btn depressed color="warning" small :href="$addBaseURL(`/role/export`)" target="_blank">
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

      <div class="main">
        <!--   数据列表   -->
        <v-data-table elevation="1" class="roleTable dataTable" fixed-header multi-sort show-select
                      :server-items-length="count" :item-class="(item)=>item.id===info.id?'activeRoleItem':'roleItem'"
                      :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                      :loading="loading" :headers="headersCurrent" :items="list" @click:row="readData"
                      @update:options="optionsChange">
          <template v-slot:top>
            <!--   编辑、新增对话框   -->
            <v-dialog v-model="formDialog" max-width="600px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ $notEmpty(form.id) ? '编辑角色' : '新增角色' }} · 快捷编辑模式</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-form :disabled="loadingSubmit">
                      <v-row>
                        <!--名称-->
                        <v-col cols="12" sm="6">
                          <v-text-field v-model="form.name" label="名称" hide-details></v-text-field>
                        </v-col>
                        <v-spacer/>
                        <!--状态-->
                        <v-col cols="12" sm="5">
                          <v-switch color="primary" v-model="form.status" :label="`状态: ${form.status===1?'启用':'停用'}`"
                                    hide-details
                                    :false-value="0" :true-value="1"/>
                        </v-col>
                        <!--数据域-->
                        <v-col cols="12" sm="6">
                          <v-select style="flex: 0 1 200px" :menu-props="{ offsetY: true }" hide-details
                                    :items="[{text:'全部',value:0},{text:'本级及下级',value:1},{text:'自定义',value:2}]"
                                    v-model="form.dataScopeModel"
                                    label="数据域"
                          ></v-select>
                        </v-col>
                        <v-spacer/>
                        <!--等级-->
                        <v-col cols="12" sm="5">
                          <v-text-field v-model="form.level" label="等级" type="number" hide-details
                                        append-outer-icon="mdi-plus" prepend-icon="mdi-minus"
                                        @click:append-outer="form.level++" @click:prepend="form.level--"/>
                        </v-col>
                        <!--数据权限(部门)-->
                        <v-col cols="12" sm="12" v-show="form.dataScopeModel===2">
                          <v-combobox :loading="loadingDept" label="数据权限(可见部门)" hide-selected
                                      hide-details item-text="name" item-value="id" clearable
                                      multiple return-object @update:search-input="v=>deptSearchName=v"
                                      hint="选择部门 输入名称搜索" small-chips deletable-chips
                                      v-model="form.depts">
                            <template v-slot:no-data>
                              <v-treeview dense hoverable :items="deptTree" return-object v-model="form.depts"
                                          item-text="name" selectable selection-type="independent"
                                          selected-color="primary"
                                          :search="deptSearchName"></v-treeview>
                            </template>
                          </v-combobox>
                        </v-col>
                        <!--备注-->
                        <v-col cols="12" sm="12">
                          <v-textarea v-model="form.remark" label="描述" hide-details filled rows="2"></v-textarea>
                        </v-col>
                        <v-spacer/>
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
                <v-card-title class="headline">{{ batchDelete ? '确认批量删除角色吗？' : '确认删除该角色吗？' }}</v-card-title>
                <v-card-actions>
                  <v-spacer/>
                  <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                  <v-btn color="error" type="" text @click="deleteItemConfirm">确定</v-btn>
                  <v-spacer/>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip color="success" v-if="item.status===1" small label>启用</v-chip>
            <v-chip color="error" v-else-if="item.status===0" small label>停用</v-chip>
          </template>
          <template v-slot:[`item.dataScopeModel`]="{ item }">
            <v-chip color="primary" v-if="item.dataScopeModel===2" small label>自定义</v-chip>
            <v-chip color="warning" v-if="item.dataScopeModel===1" small label>本级与下级</v-chip>
            <v-chip color="success" v-else-if="item.dataScopeModel===0" small label>全部</v-chip>
          </template>
          <template v-slot:[`item.allowAction`]="{ item }">
            <v-btn small icon class="mr-2" color="warning" :loading="(readLoading && info.id===item.id)" title="编辑" @click.stop="openFormDialog(item)">
              <v-icon size="20">mdi-pencil</v-icon>
            </v-btn>
            <v-btn small icon @click.stop="deleteItem(item)" title="删除角色" color="error">
              <v-icon size="20">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <!--   菜单树   -->
        <v-card class="menuTree" elevation="1" :loading="loadingMenu || readLoading">
          <v-card-title>
            菜单分配
            <v-spacer/>
            <v-btn @click="saveMenus" color="primary" small :disabled="loadingMenu || readLoading || !$notEmpty(info)">
              保存
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            {{ info.name }}
          </v-card-subtitle>
          <v-divider/>
          <v-treeview class="mt-3 mb-3" selectable :items="menuTree" selection-type="leaf" selected-color="primary"
                      dense item-text="title" open-on-click transition
                      v-model="menuTreeSelect"></v-treeview>
        </v-card>
      </div>

    </v-sheet>
  </div>
</template>

<script>

import {addRoleApi, delRoleApi, deptListApi, editRoleApi, menuListApi, readRoleApi, roleListApi} from "@/api/modules";
import qs from "qs";
import {TpSqlBuilder} from "@/utils/tp-sql";

export default {
  name: 'role',
  data() {
    return {
      deptSearchName: '',
      headers: [
        {text: 'ID', value: 'id', initHide: false},
        {text: '名称', value: 'name', initHide: false},
        {text: '等级', value: 'level', initHide: false},
        {text: '数据域', value: 'dataScopeModel', initHide: false},
        {text: '备注', value: 'remark', initHide: false},
        {text: '状态', value: 'status', initHide: false},
        {text: '创建时间', value: 'createTime'},
        {text: '创建者', value: 'createUser.username'},
        {text: '更新时间', value: 'updateTime', initHide: true},
        {text: '更新者', value: 'updateUser.username', initHide: true},
        {text: '操作', value: 'allowAction', sortable: false, align: 'center'},
      ],
      info: {},
      menuTreeSelect: [],
      menuTree: [],
      deptTree: [],
      deptTreeList: [],
      deptTreeShow: true,
      FilterMenuCreateTime: false,
      dialogDelete: false,
      batchDelete: false,
      filterToolbar: true,
      loading: false,
      loadingMenu: false,
      loadingDept: false,
      readLoading: false,
      loadingSubmit: false,
      count: 0,
      list: [],
      selected: [],
      headersShow: [],
      formDialog: false,
      form: {
        id: null,
        name: '',
        dataScopeModel: 0,
        level: 0,
        status: 1,
        remark: '',
        depts: [],
      },
      tableOptions: {},
      searchOption: {
        name: '',
        status: null,
        createTime: [],
        'createUser.username': ''
      },
      searchSqlType: {
        equal: ['status'],/* 精确查询 */
        strLike: ['name', 'createUser.username'],/* 模糊查询 */
        dateBetween: ['createTime'],/* 日期范围查询 */
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
      let qsOption = qs.stringify(option, {strictNullHandling: true});
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
      for (let k in this.searchOption) {
        if (typeof (this.searchOption[k]) == 'string') this.searchOption[k] = this.searchOption[k].trim();
      }
      let option = {...this.optionRouteROM, searchOption: this.searchOption};
      this.commitOption(option);
    },
    /* 获取指定ID数据 */
    async readData(item) {
      if (this.readLoading) return ;
      let data = {id: item.id}
      this.info = item
      this.readLoading = true
      let res = await readRoleApi(data).catch(err => err)
      this.readLoading = false
      this.info = res.info
      let leafNodes = this.$findLeafNodes(this.menuTree).map(item => item.id)
      this.menuTreeSelect = res.info.menus.filter(item => leafNodes.includes(item.id)).map(item => item.id)
      return res;
    },
    /* 获取数据 */
    fetchData() {
      this.fetchList()
      this.fetchMenus()
      this.fetchDept()
      this.menuTreeSelect = []
    },
    /* 获取角色列表 */
    async fetchList() {
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
      let res = await roleListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        let list = [...res.list]
        this.count = res.count
        this.list = list
        this.selected = []
      }
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
      let res = await delRoleApi(data).then(res => res).catch(err => err).finally(() => {
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
      if (this.$notEmpty(data.depts)) data.depts = data.depts.map(item => item.id)
      if (data.dataScopeModel !== 2) data.depts = [];
      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editRoleApi : addRoleApi;
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
    /* ******************菜单树****************** */
    async fetchMenus() {
      let data = {
        tree: true,
      }
      this.loadingMenu = true
      let res = await menuListApi(data).catch(err => err)
      this.loadingMenu = false
      if (res.status === 200) {
        this.menuTree = [...res.list]
      }
    },
    async saveMenus() {
      let data = {
        id: this.info.id,
        menus: this.menuTreeSelect
      }
      this.readLoading = true;
      let menuNodes = this.$tree2list(this.menuTree)
      data.menus = this.$findLeafFamilyList(data.menus, menuNodes)
      console.log(data.menus)
      let res = await editRoleApi(data).then(res => res).catch(err => err)
      this.readLoading = false;
      if (this.$notEmpty(res['msg']) && this.$notEmpty(res['status']) && (res['status'] === 200 || res['status'] === 201)) {
        await this.$store.dispatch('setMsg', {show: true, color: 'green', timeout: 5000, text: res['msg']})
        this.info = res.result
        let leafNodes = this.$findLeafNodes(this.menuTree).map(item => item.id)
        this.menuTreeSelect = res.result.menus.filter(item => leafNodes.includes(item.id)).map(item => item.id)
      } else if (this.$notEmpty(res['msg'])) {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: res['msg']})
        await this.readData(this.info);
      } else {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: '发生未知错误'})
        await this.readData(this.info);
      }
    },
    /* ******************菜单树****************** */
    /* ******************部门权限****************** */
    async fetchDept() {
      let data = {
        tree: true,
      }
      this.loadingDept = true
      let res = await deptListApi(data).catch(err => err)
      this.loadingDept = false
      if (res.status === 200) {
        this.deptTree = [...res.list]
        this.deptTreeList = this.$tree2list([...res.list])
      }
    },
    /* ******************部门权限****************** */

  }
}
</script>

<style lang="scss">
#role {
  height: 100%;

  .roleItem {
    cursor: pointer;
  }

  .activeRoleItem {
    cursor: pointer;
    background-color: rgba(125, 125, 125, 0.25) !important;
  }

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .main {
      flex: 0 1 auto;
      overflow: hidden;
      display: flex;
      justify-content: space-between;

      .dataTable {
        flex: 1 1 auto;
        overflow: auto;
      }

      .menuTree {
        margin-left: 30px;
        flex: 0 0 380px;
        overflow-y: auto;
        font-size: 14px;
      }
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

.notFixToolbarMain {
  #role {
    .main {
      overflow: visible;

      .dataTable {
        height: min-content;
        position: sticky;
        top: 10px;
      }

      .menuTree {
        height: min-content;
        position: sticky;
        top: 10px;
      }
    }
  }
}
</style>
