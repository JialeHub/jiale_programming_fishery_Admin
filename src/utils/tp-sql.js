// ThinkPHP SQL语句生成器
import {formatDate, notEmpty} from "@/utils/globalMethod";

export class TpSqlBuilder {
  constructor(searchType, searchOption) {
    let list = []
    let builder = {
      equal: this.equalBuilder,
      strLike: this.strLikeBuilder,
      inIdArr: this.inIdArrBuilder,
      dateBetween: this.dateBetweenBuilder,
      sectionBetween: this.sectionBetweenBuilder,
    }; //映射当前可用构造器,对应当前已有方法(xxxBuilder)
    for (let type in builder) {
      if (Array.isArray(searchType[type])) {
        searchType[type].forEach(field => {
          if (notEmpty(searchOption[field])) list.push(builder[type](field, searchOption[field]))
        })
      }
    }
    return list;
  }

  /* 精确生成 */
  equalBuilder = (field, value) => {
    return [field, '=', value];
  }
  /* In查询生成 */
  inIdArrBuilder = (field, value) => {
    return [field, 'IN', value.map(item=>item.id)];
  }
  /* 模糊查询生成 */
  strLikeBuilder = (field, value) => {
    return [field, 'LIKE', `%${value}%`];
  }
  /* 时间范围查询生成 */
  dateBetweenBuilder = (field, value) => {
    if (notEmpty(value)) {
      let range = value
      if (range.length === 1) {
        let nextDay = formatDate(new Date(new Date(range[0]).getTime() + 24 * 60 * 60 * 1000), false, 'YYYY-MM-DD')
        return [field, 'between', [range[0], nextDay]]
      } else if (range.length === 2) {
        return [field, 'between', (new Date(range[0]) < new Date(range[1])) ? range : range.reverse()]
      }
    }
  }
  /* 区间范围查询生成(1-4分) */
  sectionBetweenBuilder = (field, value) => {
    if (notEmpty(value)) {
      if (!(value[0]===-1&&value[1]===4)) {
        if (value[0]===value[1]){
          //指定某个数
          return ['score','=',value[0]]
        }else{
          return ['score','BETWEEN',value]
        }
      }
    }
  }
}

