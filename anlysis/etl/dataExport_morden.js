const dbUtils = require('../../db/script/dbUtils');
const delta = 90;
const sqlTmp = "select mana_cap,ruleset , summoner_id,monster_1_id,monster_2_id,monster_3_id,monster_4_id,monster_5_id,monster_6_id , summoner_id_lost ,monster_1_id_lost ,monster_2_id_lost ,monster_3_id_lost ,monster_4_id_lost ,monster_5_id_lost ,monster_6_id_lost into outfile 'F:p{p}.txt' Fields TERMINATED by ','  From  battle_history_raw_morden where created_date_day = '{p}';"
let today = new Date();
console.log("today : ",today , " delta day : " , delta)

async function doExport() {
  for (let i = 0; i <= delta; i++) {
    let endDate = new Date(today.setDate(today.getDate() - 1))
    let endDateStr = endDate.toISOString().split("T")[0];

    const sql = sqlTmp.replace("{p}",endDateStr).replace("{p}",endDateStr)
    await dbUtils.sqlQuery(sql,[])
    console.log(sql)
  }
}


(async ()=>{
  await doExport();
  dbUtils.pool.end(function (err) {
    // 所有的连接都已经被关闭
  });
})()