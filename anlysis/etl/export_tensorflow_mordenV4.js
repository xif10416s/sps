const dbUtils = require('../../db/script/dbUtils');
const delta = 120
const sqlTmp = "SELECT summoner_id as s1 , monster_1_id as m1, monster_2_id as m2 , monster_3_id as m3 , monster_4_id as m4 , monster_5_id as m5 , monster_6_id as m6 ,summoner_level as s1l, case when  summoner_level =1 then 1  else  monster_1_level end  as m1l, case when  summoner_level =1 then 1 else monster_2_level  end  as m2l , case when  summoner_level =1 then 1 else monster_3_level  end  as m3l , case when  summoner_level =1 then 1 else monster_4_level  end  as m4l , case when  summoner_level =1 then 1 else monster_5_level  end  as m5l  , case when  summoner_level =1 then 1 else monster_6_level  end  as m6l , mana_cap as mana , ruleset ,player_rating_initial as rating ,case inactive when '' then 'all' else inactive end as inactive ,summoner_id_lost as ems , 1 as target   into outfile 'F:p1{p}.txt' Fields TERMINATED by '$'  FROM `battle_history_raw_morden` where created_date_day = '{p}' and player_rating_initial<= 3000  "
const sqlTmp2 = "SELECT summoner_id_lost as s1 , monster_1_id_lost as m1, monster_2_id_lost as m2 , monster_3_id_lost as m3 , monster_4_id_lost as m4 , monster_5_id_lost as m5 , monster_6_id_lost as m6 ,summoner_level_lost as s1l , case when  summoner_level_lost =1 then 1  else  monster_1_level_lost end  as m1l, case when  summoner_level_lost =1 then 1 else monster_2_level_lost  end  as m2l , case when  summoner_level_lost =1 then 1 else monster_3_level_lost  end  as m3l , case when  summoner_level_lost =1 then 1 else monster_4_level_lost  end  as m4l , case when  summoner_level_lost =1 then 1 else monster_5_level_lost  end  as m5l  , case when  summoner_level_lost =1 then 1 else monster_6_level_lost  end  as m6l, mana_cap as mana , ruleset  ,player_rating_initial_lost as rating ,case inactive when '' then 'all' else inactive end as inactive ,summoner_id as ems, 0 as target  into outfile 'F:p0{p}.txt' Fields TERMINATED by '$'  FROM `battle_history_raw_morden` where created_date_day = '{p}' and player_rating_initial<= 3000 "
let today = new Date();
today = new Date(today.setDate(today.getDate() + 1))
console.log("today : ",today , " delta day : " , delta)

async function doExport() {
  for (let i = 0; i <= delta; i++) {
    let endDate = new Date(today.setDate(today.getDate() - 1))
    let endDateStr = endDate.toISOString().split("T")[0];

    const sql = sqlTmp.replace("{p}",endDateStr).replace("{p}",endDateStr)
    await dbUtils.sqlQuery(sql,[])

    const sql2 = sqlTmp2.replace("{p}",endDateStr).replace("{p}",endDateStr)
    await dbUtils.sqlQuery(sql2,[])
    console.log(sql)
  }
}


(async ()=>{
  await doExport();
  dbUtils.pool.end(function (err) {
    // 所有的连接都已经被关闭
  });
})()