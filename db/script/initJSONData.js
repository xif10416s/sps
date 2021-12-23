const mysql = require('mysql');
let history = require("../../newHistory");

// var insertTemplate = 'INSERT INTO battle_history(battle_queue_id ,summoner_id,summoner_level ,monster_1_id ,monster_1_level ,monster_1_abilities ,monster_2_id ,monster_2_level ,monster_2_abilities ,monster_3_id ,monster_3_level ,monster_3_abilities ,monster_4_id ,monster_4_level ,monster_4_abilities ,monster_5_id ,monster_5_level,monster_5_abilities ,monster_6_id,monster_6_level ,monster_6_abilities ,created_date ,created_date_day,match_type ,mana_cap ,ruleset ,inactive ,player_rating_initial ,player_rating_final ,winner ) '
//     + 'VALUES(? ,?,? ,? ,? ,? ,? ,? ,?,? ,?,? ,? ,?,?,?,?,? ,?,? ,? ,?,?,?,? ,? ,? ,? ,? ,?)';
let from_score = 400 ;

var insertTemplate = 'INSERT  ignore  INTO battle_history(battle_queue_id ,summoner_id,summoner_level ,monster_1_id ,monster_1_level ,monster_1_abilities ,monster_2_id ,monster_2_level ,monster_2_abilities ,monster_3_id ,monster_3_level ,monster_3_abilities ,monster_4_id ,monster_4_level ,monster_4_abilities ,monster_5_id ,monster_5_level,monster_5_abilities ,monster_6_id,monster_6_level ,monster_6_abilities ,created_date ,created_date_day,match_type ,mana_cap ,ruleset ,inactive ,player_rating_initial ,player_rating_final ,winner ) '
    + 'VALUES ? ';

console.log(history.length)

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  port: '3306',
  database: 'sps_battles'//上文说的名字
});
connection.connect();

let values = history.filter(x=>x['player_rating_initial'] >= from_score).map(bt => {
  bt["monster_1_id"] = bt["monster_1_id"] == "" ? -1 : bt["monster_1_id"];
  bt["monster_1_level"] = bt["monster_1_level"] == "" ? -1
      : bt["monster_1_level"];
  bt["monster_2_id"] = bt["monster_2_id"] == "" ? -1 : bt["monster_2_id"];
  bt["monster_2_level"] = bt["monster_2_level"] == "" ? -1
      : bt["monster_2_level"];
  bt["monster_3_id"] = bt["monster_3_id"] == "" ? -1 : bt["monster_3_id"];
  bt["monster_3_level"] = bt["monster_3_level"] == "" ? -1
      : bt["monster_3_level"];
  bt["monster_4_id"] = bt["monster_4_id"] == "" ? -1 : bt["monster_4_id"];
  bt["monster_4_level"] = bt["monster_4_level"] == "" ? -1
      : bt["monster_4_level"];
  bt["monster_5_id"] = bt["monster_5_id"] == "" ? -1 : bt["monster_5_id"];
  bt["monster_5_level"] = bt["monster_5_level"] == "" ? -1
      : bt["monster_5_level"];
  bt["monster_6_id"] = bt["monster_6_id"] == "" ? -1 : bt["monster_6_id"];
  bt["monster_6_level"] = bt["monster_6_level"] == "" ? -1
      : bt["monster_6_level"];
  return bt;
}).map(bt => {
  var params = [bt["battle_queue_id"], bt["summoner_id"], bt["summoner_level"],
    bt["monster_1_id"]
    , bt["monster_1_level"],
    bt["monster_1_abilities"].length >= 1 ? bt["monster_1_abilities"].join("|")
        : "", bt["monster_2_id"]
    , bt["monster_2_level"],
    bt["monster_2_abilities"].length >= 1 ? bt["monster_2_abilities"].join("|")
        : "", bt["monster_3_id"]
    , bt["monster_3_level"],
    bt["monster_3_abilities"].length >= 1 ? bt["monster_3_abilities"].join("|")
        : "", bt["monster_4_id"]
    , bt["monster_4_level"],
    bt["monster_4_abilities"].length >= 1 ? bt["monster_4_abilities"].join("|")
        : "", bt["monster_5_id"]
    , bt["monster_5_level"],
    bt["monster_5_abilities"].length >= 1 ? bt["monster_5_abilities"].join("|")
        : "", bt["monster_6_id"]
    , bt["monster_6_level"],
    bt["monster_6_abilities"].length >= 1 ? bt["monster_6_abilities"].join("|")
        : ""
    , bt["created_date"], bt["created_date"].split("T")[0], bt["match_type"],
    bt["mana_cap"], bt["ruleset"], bt["inactive"], bt["player_rating_initial"],
    bt["player_rating_final"], bt["winner"]];
  return params;
})

let batch = 500;
let tmp = []
values.forEach((v, i) => {
  tmp.push(v)
  if(i % batch == 0) {
    connection.query(insertTemplate, [tmp], function (err, rows, fields) {
      if(err){
        console.log('INSERT ERROR - ', err.message);
        return;
      }
    });
    tmp = [];
  }
})

if(tmp.length >0){
  connection.query(insertTemplate, [tmp], function (err, rows, fields) {
    if(err){
      console.log('INSERT ERROR - ', err.message);
      return;
    }
  });
}


connection.end();
