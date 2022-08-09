const dbUtils = require('../../db/script/dbUtils');

const sqlTmp = "select * into outfile 'F:p{p}.txt' Fields TERMINATED by ','  From  battle_history_raw_v2 PARTITION(p{p});"
let today = new Date("2022-07-07");
const dropTmp = "alter table battle_history_raw_v2 drop partition p{p}; "
let endDayDate = new Date("2021-11-01")
let endDate = new Date(today.setDate(today.getDate() - 1))
async function doExport() {
while(endDate.getTime() - endDayDate.getTime() >=0) {
    endDate = new Date(today.setDate(today.getDate() - 1))
    let endDateStr = endDate.toISOString().split("T")[0].replace("-","").replace("-","");
    const sql = sqlTmp.replace("{p}",endDateStr).replace("{p}",endDateStr)
    // await dbUtils.sqlQuery(sql,[])
    console.log(sql)
  }
}

function makeDropSql(){
  while(endDate.getTime() - endDayDate.getTime() >=0) {
    endDate = new Date(today.setDate(today.getDate() - 1))
    let endDateStr = endDate.toISOString().split("T")[0].replace("-","").replace("-","");
    const sql = dropTmp.replace("{p}",endDateStr).replace("{p}",endDateStr)
    console.log(sql)
  }
}


(async ()=>{
  // await doExport();
  dbUtils.pool.end(function (err) {
    // 所有的连接都已经被关闭
  });

  makeDropSql()
})()