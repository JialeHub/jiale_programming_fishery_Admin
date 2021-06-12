<template>
  <div id="dept">
    <!--<v-simple-table>
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left" style="padding-left: 36px;">Name</th>
          <th class="text-left">状态</th>
          <th class="text-left">排序</th>
          <th class="text-left">深度</th>
          <th class="text-left">创建时间</th>
        </tr>
        </thead>
        <transition-group name="list" tag="tbody">
          <tr v-for="(item,index) in list" :key="item.id" v-show="item.allowAction" class="listTr">
            <td @click="expandChildren(item)" style="padding-left: 2px;"
                :style="(index!==list.length-1 && list[index+1].level>item.level)?'cursor: pointer':''">
              <span :style="`padding-left: ${18*(item.level-1)}px;`">
                <span v-if="index!==list.length-1 && list[index+1].level>item.level">
                  <v-btn icon>
                    <v-icon :class="list[index+1].allowAction?'menuDown':'menuDownR'">mdi-menu-down</v-icon>
                  </v-btn>
                  <span>{{ item.name }}</span>
                </span>
                <span v-else :style="item.level>0?'padding-left: 36px':''">{{ item.name }}</span>
              </span>
            </td>
            <td>{{ item.status }}</td>
            <td>{{ item.sort }}</td>
            <td>{{ item.level }}</td>
            <td>{{ item.createTime }}</td>
          </tr>
        </transition-group>
      </template>
    </v-simple-table>-->
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-text-field label="部门名称" style="flex: 0 1 200px" solo hint="部门名称" dense
                      v-model="searchOption.name" clearable hide-details
                      placeholder="输入部门名称"></v-text-field>

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
            <v-btn depressed color="warning" small
                   :href="$addBaseURL(`/dept/export${searchOption.treeMode?'?tree=false':''}`)" target="_blank">
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
            <v-btn depressed tile small @click="leafCheck=!leafCheck" title="自动选择下级" v-if="searchOption.treeMode"
                   :class="leafCheck?['v-btn--active']:[]">
              <v-icon small>mdi-checkbox-multiple-marked-outline</v-icon>
            </v-btn>
            <v-btn depressed tile small @click="treeModeChange" title="树状结构"
                   :class="searchOption.treeMode?['v-btn--active']:[]">
              <v-icon small>mdi-file-tree</v-icon>
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

      <!--   数据列表 树状列表   -->
      <v-data-table elevation="1" class="deptTable dataTable" fixed-header multi-sort show-select
                    :hide-default-footer="searchOption.treeMode" :disable-pagination="searchOption.treeMode"
                    :server-items-length="searchOption.treeMode?-1:count"
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange" @item-selected="itemSelected">
        <template v-slot:top>
          <!--   编辑、新增对话框   -->
          <v-dialog v-model="formDialog" max-width="600px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ $notEmpty(form.id) ? '编辑部门' : '新增部门' }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form :disabled="loadingSubmit">
                    <v-row>
                      <v-col cols="12" sm="7">
                        <v-text-field v-model="form.name" label="部门名称"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="5">
                        <v-text-field v-model="form.sort" label="排序" type="number"
                                      append-outer-icon="mdi-plus" prepend-icon="mdi-minus"
                                      @click:append-outer="form.sort++" @click:prepend="form.sort--"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="7">
                        <v-combobox :loading="loadingTree" label="上级部门" hide-selected
                                    item-text="name" item-value="id" clearable multiple
                                    placeholder="无（顶级部门）"
                                    return-object @update:search-input="v=>listTreeSearch=v"
                                    hide-details v-model="form.pid">
                          <template v-slot:no-data>
                            <v-treeview dense activatable hoverable :items="listTree" return-object
                                        :active.sync="form.pid"
                                        item-text="name" :search="listTreeSearch"></v-treeview>
                          </template>
                        </v-combobox>
                      </v-col>
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
              <v-card-title class="headline">{{ batchDelete ? '确认批量删除选中部门及其子级部门吗？' : '确认删除该部门及其子级部门吗？' }}</v-card-title>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                <v-btn color="error" type="" text @click="deleteItemConfirm">确定</v-btn>
                <v-spacer/>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:[`item.name`]="{ item }" v-if="searchOption.treeMode">
          <div @click="expandChildren(item)"
               :style="`padding-left: ${18*(item.level-1)}px;`+((item.index!==list.length-1 && list[item.index+1].level>item.level)?'cursor: pointer':'')">
            <span v-if="item.index!==list.length-1 && list[item.index+1].level>item.level">
              <v-btn icon small>
                <v-icon :class="list[item.index+1].allowAction?'menuDown':'menuDownR'">mdi-menu-down</v-icon>
              </v-btn>
              <span>{{ item.name }}</span>
            </span>
            <span v-else :style="item.level>0?'padding-left: 28px':''">{{ item.name }}</span>
          </div>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip color="success" v-if="item.status===1" small label>启用</v-chip>
          <v-chip color="error" v-else-if="item.status===0" small label>停用</v-chip>
        </template>
        <template v-slot:[`item.allowAction`]="{ item }">
          <v-btn icon class="mr-2" small @click="openFormDialog(item,true)" title="新增子级" color="primary">
            <v-icon size="20">mdi-plus</v-icon>
          </v-btn>
          <v-btn icon class="mr-2" small @click="openFormDialog(item)" title="编辑" color="warning"
                 :loading="loadingTree">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteItem(item)" title="删除本级和子级" color="error" :loading="loadingTree">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

    </v-sheet>
  </div>
</template>

<script>

import {addDeptApi, delDeptApi, deptListApi, editDeptApi} from "@/api/modules";
import qs from "qs";
import {TpSqlBuilder} from "@/utils/tp-sql";

export default {
  name: 'dept',
  data() {
    return {
      FilterMenuCreateTime: false,
      dialogDelete: false,
      batchDelete: false,
      leafCheck: true,
      filterToolbar: true,
      loading: false,
      loadingTree: false,
      loadingSubmit: false,
      count: 0,
      list: [],
      listTree: [],
      selected: [],
      headersShow: [],
      headers: [
        {text: '部门名称', value: 'name'},
        {text: 'id', value: 'id', initHide: true},
        {text: '深度', value: 'level', sortable: false, initHide: true},
        {text: '排序', value: 'sort'},
        {text: '状态', value: 'status'},
        {text: '创建时间', value: 'createTime'},
        {text: '创建者', value: 'createUser.username'},
        {text: '更新时间', value: 'updateTime', initHide: true},
        {text: '更新者', value: 'updateUser.username', initHide: true},
        {text: '操作', value: 'allowAction', filter: value => value, sortable: false, align: 'center'},/* 是否显示 */
      ],
      formDialog: false,
      form: {
        id: null,
        name: '',
        sort: 0,
        pid: [],
        status: 1,
      },
      tableOptions: {},
      searchOption: {
        treeMode: true,
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
      listTreeSearch: '',
    };
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
    /* 监听路由变化后触发 */
    '$route.query': {
      handler() {
        this.initOptions();
        this.fetchData();
        this.fetchDeptTree()
      },
      immediate: true,
      deep: true
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  methods: {
    itemSelected(itemObj) {
      if (this.leafCheck && this.searchOption.treeMode) {
        let {item, value} = itemObj;
        let childrenDept = this.$treeFindChildrens(this.list, item.id)
        let selectedIds = this.selected.map(item => item.id)
        if (value) {
          this.selected = this.selected.concat([...childrenDept, item].filter(item => !selectedIds.includes(item.id)));
        } else {
          this.selected = this.selected.filter(item2 => ![...childrenDept.map(item => item.id), item.id].includes(item2.id))
        }
      }
    },
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
    /* 切换树模式 */
    treeModeChange() {
      this.searchOption.treeMode = !this.searchOption.treeMode
      let option = {...this.optionRouteROM, searchOption: this.searchOption};
      this.commitOption(option);
    },
    /* 开始搜索 */
    search() {
      for (let k in this.searchOption) {
        if (typeof (this.searchOption[k]) == 'string') this.searchOption[k] = this.searchOption[k].trim();
      }
      let option = {...this.optionRouteROM, searchOption: this.searchOption};
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

      let data = this.searchOption.treeMode ? {
        tree: false,
        searchList,
        sortList
      } : {
        page: option.page,
        limit: option.itemsPerPage,
        searchList,
        sortList
      }
      this.loading = true
      let res = await deptListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        let list = [...res.list]
        list.forEach((item, index) => {
          let cacheObj = Array.isArray(this.list) && this.list.find(item2 => item2.id === item.id)
          if (this.$notEmpty(cacheObj) && this.$notEmpty(cacheObj['allowAction'])) {
            item['allowAction'] = cacheObj['allowAction']
          } else {
            // item['allowAction'] = item['level'] === 1
            item['allowAction'] = true
          }
          item['index'] = index
        })
        this.count = res.count
        this.list = list
        this.selected = []
      }
    },
    async fetchDeptTree() {
      let data = {
        tree: true,
      }
      this.loadingTree = true
      let res = await deptListApi(data).catch(err => err)
      this.loadingTree = false
      if (res.status === 200) {
        this.listTree = [...res.list]
        this.listTreeList = this.$tree2list([...res.list])
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
      let res = await delDeptApi(data).then(res => res).catch(err => err).finally(() => {
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
    openFormDialog(item, isAddChildren = false) {
      if (isAddChildren && this.$notEmpty(item) && this.$notEmpty(item['id'])) {
        // 添加子级部门
        this.form.pid = [item]
      } else if (!isAddChildren && this.$notEmpty(item) && this.$notEmpty(item['id'])) {
        // 编辑
        let pidItem = this.listTreeList.find(item2 => item.pid === item2.id)
        this.$objectEvaluate(this.form, {...item, pid: this.$notEmpty(pidItem) ? [pidItem] : []})
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
      if (this.$notEmpty(data.pid)) data.pid = data.pid.map(item => item.id)
      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editDeptApi : addDeptApi;
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
    /* ******************导出数据****************** */
    async exportData() {
      // axios异步下载 不推荐
    },
    /* ******************导出数据****************** */
    /* 展开子级 */
    expandChildren(dept) {
      let stackPid = [dept.id]
      this.list.forEach(item => {
        if (item.level > dept.level && stackPid.indexOf(item.pid) !== -1 && item['allowAction'] === true) {
          item['allowAction'] = false;
          if (stackPid.indexOf(item.id) === -1) stackPid.unshift(item.id);
        } else if (item.pid === dept.id && item['allowAction'] === false) {
          item['allowAction'] = true;
        }
      })
      this.list = [...this.list]
    }
  }
}
</script>

<style lang="scss">
#dept {
  height: 100%;

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .deptTable {
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
