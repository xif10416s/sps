const mysql = require('mysql');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  port: '3306',
  database: 'sps_battles'//上文说的名字
});

// const pool = mysql.createPool({
//   host: '10.100.3.27',
//   user: 'root',
//   password: 'xsmysql',
//   port: '3306',
//   database: 'demo_test'
// });


var insertTemplate = 'INSERT  ignore  INTO battle_history(battle_queue_id ,summoner_id,summoner_level ,monster_1_id ,monster_1_level ,monster_1_abilities ,monster_2_id ,monster_2_level ,monster_2_abilities ,monster_3_id ,monster_3_level ,monster_3_abilities ,monster_4_id ,monster_4_level ,monster_4_abilities ,monster_5_id ,monster_5_level,monster_5_abilities ,monster_6_id,monster_6_level ,monster_6_abilities ,created_date ,created_date_day,match_type ,mana_cap ,ruleset ,inactive ,player_rating_initial ,player_rating_final ,winner ) '
    + 'VALUES ? ';

var insertTemplateRaw = 'INSERT  ignore  INTO battle_history_raw(battle_queue_id ,summoner_id,summoner_level ,monster_1_id ,monster_1_level ,monster_1_abilities ,monster_2_id ,monster_2_level ,monster_2_abilities ,monster_3_id ,monster_3_level ,monster_3_abilities ,monster_4_id ,monster_4_level ,monster_4_abilities ,monster_5_id ,monster_5_level,monster_5_abilities ,monster_6_id,monster_6_level ,monster_6_abilities ,created_date ,created_date_day,match_type ,mana_cap ,ruleset ,inactive ,player_rating_initial ,player_rating_final ,winner,' +
    ' battle_queue_id_lost ,summoner_id_lost,summoner_level_lost ,monster_1_id_lost ,monster_1_level_lost ,monster_1_abilities_lost ,monster_2_id_lost ,monster_2_level_lost ,monster_2_abilities_lost ,monster_3_id_lost ,monster_3_level_lost ,monster_3_abilities_lost ,monster_4_id_lost ,monster_4_level_lost ,monster_4_abilities_lost ,monster_5_id_lost ,monster_5_level_lost,monster_5_abilities_lost ,monster_6_id_lost,monster_6_level_lost ,monster_6_abilities_lost,player_rating_initial_lost ,player_rating_final_lost ,loser) '
    + 'VALUES ? ';

const sqlQuery = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        if (values) {
          connection.query(sql, values, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
            connection.release();
          });
        } else {
          connection.query(sql, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
            connection.release();
          });
        }
      }
    });
  });
};

/**
 *
 * @param history
 * @param fromScore
 * @param batchSize
 * @param fromDay 2021-11-31
 * @returns {Promise<void>}
 */
async function batchInsert(history, fromScore, batchSize, fromDay) {
  let values = history.filter(x => x['player_rating_initial'] >= fromScore)
      .filter(x => {
        if (fromDay != null) {
          return x['created_date'].split('T')[0] >= fromDay;
        } else {
          return true;
        }
      }).map(bt => {
        bt['monster_1_id'] = bt['monster_1_id'] == '' ? -1 : bt['monster_1_id'];
        bt['monster_1_level'] = bt['monster_1_level'] == '' ? -1
            : bt['monster_1_level'];
        bt['monster_2_id'] = bt['monster_2_id'] == '' ? -1 : bt['monster_2_id'];
        bt['monster_2_level'] = bt['monster_2_level'] == '' ? -1
            : bt['monster_2_level'];
        bt['monster_3_id'] = bt['monster_3_id'] == '' ? -1 : bt['monster_3_id'];
        bt['monster_3_level'] = bt['monster_3_level'] == '' ? -1
            : bt['monster_3_level'];
        bt['monster_4_id'] = bt['monster_4_id'] == '' ? -1 : bt['monster_4_id'];
        bt['monster_4_level'] = bt['monster_4_level'] == '' ? -1
            : bt['monster_4_level'];
        bt['monster_5_id'] = bt['monster_5_id'] == '' ? -1 : bt['monster_5_id'];
        bt['monster_5_level'] = bt['monster_5_level'] == '' ? -1
            : bt['monster_5_level'];
        bt['monster_6_id'] = bt['monster_6_id'] == '' ? -1 : bt['monster_6_id'];
        bt['monster_6_level'] = bt['monster_6_level'] == '' ? -1
            : bt['monster_6_level'];
        return bt;
      }).map(bt => {
        var params = [bt['battle_queue_id'], bt['summoner_id'], bt['summoner_level'],
          bt['monster_1_id']
          , bt['monster_1_level'],
          bt['monster_1_abilities'].length >= 1 ? bt['monster_1_abilities'].join('|')
              : '', bt['monster_2_id']
          , bt['monster_2_level'],
          bt['monster_2_abilities'].length >= 1 ? bt['monster_2_abilities'].join('|')
              : '', bt['monster_3_id']
          , bt['monster_3_level'],
          bt['monster_3_abilities'].length >= 1 ? bt['monster_3_abilities'].join('|')
              : '', bt['monster_4_id']
          , bt['monster_4_level'],
          bt['monster_4_abilities'].length >= 1 ? bt['monster_4_abilities'].join('|')
              : '', bt['monster_5_id']
          , bt['monster_5_level'],
          bt['monster_5_abilities'].length >= 1 ? bt['monster_5_abilities'].join('|')
              : '', bt['monster_6_id']
          , bt['monster_6_level'],
          bt['monster_6_abilities'].length >= 1 ? bt['monster_6_abilities'].join('|')
              : ''
          , bt['created_date'], bt['created_date'].split('T')[0], bt['match_type'],
          bt['mana_cap'], bt['ruleset'], bt['inactive'], bt['player_rating_initial'],
          bt['player_rating_final'], bt['winner']];
        return params;
      });

  let tmp = [];
  for (const [i, v] of values.entries()) {
    tmp.push(v);
    if (i % batchSize == 0) {
      // console.log("batch insert start ..." + new Date());
      await sqlQuery(insertTemplate, [tmp]);
      tmp = [];
      // console.log("batch insert end ..." + new Date());
    }
  }

  if (tmp.length > 0) {
    console.log('last batch insert start ...' + new Date());
    await sqlQuery(insertTemplate, [tmp]);
    console.log('last batch insert end ...' + new Date());
  }
}

function washdata(bt, fields) {
  fields.forEach(field => {
    bt[field] = bt[field] == '' ? -1 : bt[field];
  });
}


function joinAbality(bt, field) {
  return bt[field].length >= 1 ? bt[field].join('|') : '';
}

async function batchInsertRaw(history, fromScore, batchSize, fromDay) {
  let values = history
      .filter(x => x['player_rating_initial'] >= fromScore)
      .filter(x => {
        if (fromDay != null) {
          return x['created_date'].split('T')[0] >= fromDay;
        } else {
          return true;
        }
      })
      .map(bt => {
        washdata(bt, ['monster_1_id', 'monster_1_level', 'monster_2_id', 'monster_2_level',
          'monster_3_id', 'monster_3_level', 'monster_4_id', 'monster_4_level',
          'monster_5_id', 'monster_5_level', 'monster_6_id', 'monster_6_level',
          'monster_1_id_lost', 'monster_1_level_lost', 'monster_2_id_lost', 'monster_2_level_lost',
          'monster_3_id_lost', 'monster_3_level_lost', 'monster_4_id_lost', 'monster_4_level_lost',
          'monster_5_id_lost', 'monster_5_level_lost', 'monster_6_id_lost', 'monster_6_level_lost']);
        return bt;
      }).map(bt => {
        var params = [bt['battle_queue_id'], bt['summoner_id'], bt['summoner_level'],
              bt['monster_1_id']
              , bt['monster_1_level'],
              joinAbality(bt, 'monster_1_abilities')
              , bt['monster_2_id']
              , bt['monster_2_level'],
              joinAbality(bt, 'monster_2_abilities')
              , bt['monster_3_id']
              , bt['monster_3_level'],
              joinAbality(bt, 'monster_3_abilities')
              , bt['monster_4_id']
              , bt['monster_4_level'],
              joinAbality(bt, 'monster_4_abilities')
              , bt['monster_5_id']
              , bt['monster_5_level'],
              joinAbality(bt, 'monster_5_abilities')
              , bt['monster_6_id']
              , bt['monster_6_level'],
              joinAbality(bt, 'monster_6_abilities')
              , bt['created_date'], bt['created_date'].split('T')[0], bt['match_type'],
              bt['mana_cap'], bt['ruleset'], bt['inactive'], bt['player_rating_initial'],
              bt['player_rating_final'], bt['winner'],
              bt['battle_queue_id_lost'], bt['summoner_id_lost'], bt['summoner_level_lost'],
              bt['monster_1_id_lost']
              , bt['monster_1_level_lost'],
              joinAbality(bt, 'monster_1_abilities_lost')
              , bt['monster_2_id_lost']
              , bt['monster_2_level_lost'],
              joinAbality(bt, 'monster_2_abilities_lost')
              , bt['monster_3_id_lost']
              , bt['monster_3_level_lost'],
              joinAbality(bt, 'monster_3_abilities_lost')
              , bt['monster_4_id_lost']
              , bt['monster_4_level_lost'],
              joinAbality(bt, 'monster_4_abilities_lost')
              , bt['monster_5_id_lost']
              , bt['monster_5_level_lost'],
              joinAbality(bt, 'monster_5_abilities_lost')
              , bt['monster_6_id_lost']
              , bt['monster_6_level_lost'],
              joinAbality(bt, 'monster_6_abilities_lost')
              , bt['player_rating_initial_lost'],
              bt['player_rating_final_lost'], bt['loser']
            ]
        ;
        return params;
      });

  let tmp = [];
  for (const [i, v] of values.entries()) {
    tmp.push(v);
    if (i % batchSize == 0) {
      // console.log("batch insert start ..." + new Date());
      await sqlQuery(insertTemplateRaw, [tmp]);
      tmp = [];
      // console.log("batch insert end ..." + new Date());
    }
  }

  if (tmp.length > 0) {
    console.log('last batch insert start ...' + new Date());
    await sqlQuery(insertTemplateRaw, [tmp]);
    console.log('last batch insert end ...' + new Date());
  }
}


// console.log(data2);
module.exports.sqlQuery = sqlQuery;
module.exports.batchInsert = batchInsert;
module.exports.batchInsertRaw = batchInsertRaw;
module.exports.pool = pool;

// test...............
// (async ()=>{
//   const data = await sqlQuery(`select * from battle_history`);
//   var string=JSON.stringify(data);;
//   var json =  JSON.parse(string);
//   console.log(JSON.stringify(json[0]))
// })()

// let history = require("../../data/berindon_Raw");
//
// (async ()=>{
//   console.log(history.length)
//   await batchInsertRaw(history,0,500,null)
//   console.log("-----------")
// })()
