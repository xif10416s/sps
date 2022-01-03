const dbUtils = require('./dbUtils');
const mostUserMonsterSql = "select id , count(*) as cnt  from ("
    + "select monster_1_id as id  ,  created_date_day , player_rating_initial ,ruleset  from battle_history_raw_v2 where monster_1_id != -1 and monster_1_id not in(157,158,159,160,395,396,397,398,399,161,162,163,167,400,401,402,403,440,168,169,170,171,381,382,383,384,385,172,173,174,178,386,387,388,389,437,179,180,181,182,334,367,368,369,370,371,183,184,185,189,372,373,374,375,439,146,147,148,149,409,410,411,412,413,150,151,152,156,414,415,416,417,441,135,136,137,138,353,354,355,356,357,139,140,141,145,358,359,360,361,438,224,190,191,192,193,423,424,425,426,194,195,196,427,428,429) "
    + "union all "
    + "select monster_2_id as id  ,  created_date_day , player_rating_initial ,ruleset from battle_history_raw_v2 where monster_2_id != -1 and  monster_2_id not in(157,158,159,160,395,396,397,398,399,161,162,163,167,400,401,402,403,440,168,169,170,171,381,382,383,384,385,172,173,174,178,386,387,388,389,437,179,180,181,182,334,367,368,369,370,371,183,184,185,189,372,373,374,375,439,146,147,148,149,409,410,411,412,413,150,151,152,156,414,415,416,417,441,135,136,137,138,353,354,355,356,357,139,140,141,145,358,359,360,361,438,224,190,191,192,193,423,424,425,426,194,195,196,427,428,429) "
    + "union all "
    + "select monster_3_id as id  ,  created_date_day , player_rating_initial ,ruleset from battle_history_raw_v2 where monster_3_id != -1 and  monster_3_id not in(157,158,159,160,395,396,397,398,399,161,162,163,167,400,401,402,403,440,168,169,170,171,381,382,383,384,385,172,173,174,178,386,387,388,389,437,179,180,181,182,334,367,368,369,370,371,183,184,185,189,372,373,374,375,439,146,147,148,149,409,410,411,412,413,150,151,152,156,414,415,416,417,441,135,136,137,138,353,354,355,356,357,139,140,141,145,358,359,360,361,438,224,190,191,192,193,423,424,425,426,194,195,196,427,428,429) "
    + "union all "
    + "select monster_4_id as id  ,  created_date_day , player_rating_initial ,ruleset from battle_history_raw_v2 where monster_4_id != -1 and  monster_4_id not in(157,158,159,160,395,396,397,398,399,161,162,163,167,400,401,402,403,440,168,169,170,171,381,382,383,384,385,172,173,174,178,386,387,388,389,437,179,180,181,182,334,367,368,369,370,371,183,184,185,189,372,373,374,375,439,146,147,148,149,409,410,411,412,413,150,151,152,156,414,415,416,417,441,135,136,137,138,353,354,355,356,357,139,140,141,145,358,359,360,361,438,224,190,191,192,193,423,424,425,426,194,195,196,427,428,429) "
    + "union all "
    + "select monster_5_id as id  ,  created_date_day , player_rating_initial ,ruleset from battle_history_raw_v2 where monster_5_id != -1 and  monster_5_id not in(157,158,159,160,395,396,397,398,399,161,162,163,167,400,401,402,403,440,168,169,170,171,381,382,383,384,385,172,173,174,178,386,387,388,389,437,179,180,181,182,334,367,368,369,370,371,183,184,185,189,372,373,374,375,439,146,147,148,149,409,410,411,412,413,150,151,152,156,414,415,416,417,441,135,136,137,138,353,354,355,356,357,139,140,141,145,358,359,360,361,438,224,190,191,192,193,423,424,425,426,194,195,196,427,428,429) "
    + "union all "
    + "select monster_6_id as id  ,  created_date_day , player_rating_initial ,ruleset from battle_history_raw_v2 where monster_6_id != -1 and  monster_6_id not in(157,158,159,160,395,396,397,398,399,161,162,163,167,400,401,402,403,440,168,169,170,171,381,382,383,384,385,172,173,174,178,386,387,388,389,437,179,180,181,182,334,367,368,369,370,371,183,184,185,189,372,373,374,375,439,146,147,148,149,409,410,411,412,413,150,151,152,156,414,415,416,417,441,135,136,137,138,353,354,355,356,357,139,140,141,145,358,359,360,361,438,224,190,191,192,193,423,424,425,426,194,195,196,427,428,429) "
    + ") t where t.id  != -1 and t.created_date_day >= ? and t.player_rating_initial >= ? and t.player_rating_initial <= ? and ( t.ruleset =? or t.ruleset =? ) "
    + " group by id order by cnt desc limit 50; "

async function getMostUsefullMonster(fromScore , endScore ,ruleset){
  let reserve = ruleset;
  if(ruleset.length > 1){
    let rules = ruleset.split("|");
    reserve = rules[1] +"|"+rules[0]
  }
  console.log(mostUserMonsterSql)
  let data = await dbUtils.sqlQuery(mostUserMonsterSql,["2021-12-05",fromScore,endScore,ruleset,reserve])
  let string = JSON.stringify(data);
  let rs = JSON.parse(string);
  return rs;
}

module.exports.getMostUsefullMonster = getMostUsefullMonster;