<template>
  <div id="collect">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-menu v-model="FilterMenuCreateTime" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="发布时间" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption['publish.createTime']" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker range v-model="searchOption['publish.createTime']" clearable></v-date-picker>
        </v-menu>

        <v-menu v-model="FilterMenuUpdateTime" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="评价时间" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption['publish.updateTime']" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker range v-model="searchOption['publish.updateTime']" clearable></v-date-picker>
        </v-menu>

        <v-text-field label="发布者" hint="发布者" style="flex: 0 1 200px" outlined dense hide-details
                      v-model="searchOption['username']" clearable
        ></v-text-field>

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
            <v-btn depressed color="warning" small :href="$addBaseURL(`/publish/collectExport`)" target="_blank">
              <v-icon left small>mdi-download</v-icon>
              全部导出
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
      <v-data-table elevation="1" class="publishTable dataTable" fixed-header multi-sort
                    :server-items-length="count"
                    :custom-sort="(items=>items)" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:[`item.avatar`]="{ item }">
          <v-avatar size="36">
            <img :src="$addBaseURL(item['avatar'])" alt="无">
          </v-avatar>
        </template>
        <template v-slot:[`item.username`]="{ item }">
          <span>{{item['username']}}</span>
        </template>
        <template v-slot:no-data>暂无数据</template>
      </v-data-table>

    </v-sheet>
  </div>
</template>

<script>
import qs from "qs";
import {
  getCollectApi,
} from "@/api/modules";
import {TpSqlBuilder} from "@/utils/tp-sql";

export default {
  name: 'collect',
  data() {
    return {
      title:'评分汇总',
      headers: [
        {text: '用户id', value: 'id', class: 'minWidth60'},
        {text: '账号', value: 'username', class: 'minWidth60'},
        {text: '头像', value: 'avatar', class: 'minWidth60'},
        {text: '总分', value: 'scoreSum', class: 'minWidth60'},
        {text: '最高分', value: 'scoreMax', class: 'minWidth60'},
        {text: '最低分', value: 'scoreMin', class: 'minWidth60'},
        {text: '平均分', value: 'scoreAvg', class: 'minWidth60'},
        {text: '已评数', value: 'scoreCount', class: 'minWidth60'},
        {text: '未评数', value: 'scoreNone', class: 'minWidth60'},
        {text: '发表数', value: 'publishCount', class: 'minWidth60'},
        {text: '注册时间', value: 'createTime', class: 'minWidth110'},

        {text: '操作', value: 'allowAction', sortable: false, align: 'center', initHide:true, class: 'minWidth150'},
      ],
      FilterMenuCreateTime: false,
      FilterMenuUpdateTime: false,
      filterToolbar: true,
      loading: false,
      count: 0,
      list: [],
      headersShow: [],
      tableOptions: {},
      searchOption: {
        'publish.createTime': [],
        'publish.updateTime': [],
        username: ''
      },
      searchSqlType: {
        strLike: ['username'],/* 模糊查询 */
        dateBetween: ['publish.createTime','publish.updateTime',],/* 日期范围查询 */
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
  },
  methods: {
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
      let res = await getCollectApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        let list = [...res.list]
        this.count = res.count
        this.list = list
      }
    },
  }
}
</script>

<style lang="scss">
#collect {
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
