Date.prototype.Format = function(fmt)
{ //author: meizz
  var o = {
    'M+' : this.getMonth()+1,                 //月份
    'd+' : this.getDate(),                    //日
    'h+' : this.getHours(),                   //小时
    'm+' : this.getMinutes(),                 //分
    's+' : this.getSeconds(),                 //秒
    'q+' : Math.floor((this.getMonth()+3)/3), //季度
    'S'  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+'').substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp('('+ k +')').test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (('00'+ o[k]).substr((''+ o[k]).length)));
  return fmt;
};
// let date = new Date(2021,11,5);
// date.Format('yyyyMMdd')
// for (let i = 0; i <365 ; i++) {
//   date = date.setDate(date.getDate()+1)
//   date = new Date(date);
//   let pstr = date.Format("yyyyMMdd")
//   let pt = date.Format("yyyy-MM-dd")
//   console.log(`alter table battle_history_raw_v2 add partition (partition p${pstr} values less than('${pt}'))`);
// }


var date = new Date();
var fromDate =  new Date(date.setDate(date.getDate()+2))
console.log(fromDate.toISOString().split("T")[0])