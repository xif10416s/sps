const fetch = require('node-fetch');
const fs = require('fs');

const topBattleUser = require('./data/initUsers/topBattleUser');
const modern_newTopBattleUsers = require(
    './data/initUsers/modern_topBattleUserJSON');
const wild_newTopBattleUsers = require(
    './data/initUsers/wild_topBattleUserJSON');
const intUsers = [];
let remainFileModern = `data/modern_remain_raw.json`;
let remainFileWild = `data/wild_remain_raw.json`;
const remainUsersModern = require(`./data/modern_remain_raw`);
const remainUsersWild = require(`./data/wild_remain_raw`);
const dbUtil = require('./db/script/dbUtils');
const HttpsProxyAgent = require('https-proxy-agent');
const proxyAgent = new HttpsProxyAgent('http://192.168.99.1:1081');

async function getBattleHistoryRaw(player = '', format, data = {}) {
  try {
    const battleHistory = await fetch(
        'https://api2.splinterlands.com/battle/history2?player='
        + player.toLocaleLowerCase() + "&format=" + format
        + "&v=1657932127908&token=O8WX6PK9KG&username=xgq123"
        // ,{agent: proxyAgent}
        )
    .then((response) => {
      if (!response.ok) {
        console.log('error');
        return null;
      }
      return response;
    })
    .then((battleHistory) => {
      return battleHistory.json();
    })
    .catch((error) => {
      // console.error('There has been a problem with your fetch operation:',
      //     error);
    });
    // console.log("get battles -----",player, battleHistory.battles.length)
    return battleHistory.battles;
  } catch (e) {
    return null;
  }

}

const extractGeneralInfo = (x) => {
  return {
    created_date: x.created_date ? x.created_date : '',
    match_type: x.match_type ? x.match_type : '',
    mana_cap: x.mana_cap ? x.mana_cap : '',
    ruleset: x.ruleset ? x.ruleset : '',
    inactive: x.inactive ? x.inactive : ''
  };
};

const extractMonster = (team) => {
  const monster1 = team.monsters[0];
  const monster2 = team.monsters[1];
  const monster3 = team.monsters[2];
  const monster4 = team.monsters[3];
  const monster5 = team.monsters[4];
  const monster6 = team.monsters[5];

  return {
    summoner_id: team.summoner.card_detail_id,
    summoner_level: team.summoner.level,
    monster_1_id: monster1 ? monster1.card_detail_id : '',
    monster_1_level: monster1 ? monster1.level : '',
    monster_1_abilities: monster1 ? monster1.abilities : '',
    monster_2_id: monster2 ? monster2.card_detail_id : '',
    monster_2_level: monster2 ? monster2.level : '',
    monster_2_abilities: monster2 ? monster2.abilities : '',
    monster_3_id: monster3 ? monster3.card_detail_id : '',
    monster_3_level: monster3 ? monster3.level : '',
    monster_3_abilities: monster3 ? monster3.abilities : '',
    monster_4_id: monster4 ? monster4.card_detail_id : '',
    monster_4_level: monster4 ? monster4.level : '',
    monster_4_abilities: monster4 ? monster4.abilities : '',
    monster_5_id: monster5 ? monster5.card_detail_id : '',
    monster_5_level: monster5 ? monster5.level : '',
    monster_5_abilities: monster5 ? monster5.abilities : '',
    monster_6_id: monster6 ? monster6.card_detail_id : '',
    monster_6_level: monster6 ? monster6.level : '',
    monster_6_abilities: monster6 ? monster6.abilities : ''
  };
};

const extractMonsterLost = (team) => {
  const monster1 = team.monsters[0];
  const monster2 = team.monsters[1];
  const monster3 = team.monsters[2];
  const monster4 = team.monsters[3];
  const monster5 = team.monsters[4];
  const monster6 = team.monsters[5];

  return {
    summoner_id_lost: team.summoner.card_detail_id,
    summoner_level_lost: team.summoner.level,
    monster_1_id_lost: monster1 ? monster1.card_detail_id : '',
    monster_1_level_lost: monster1 ? monster1.level : '',
    monster_1_abilities_lost: monster1 ? monster1.abilities : '',
    monster_2_id_lost: monster2 ? monster2.card_detail_id : '',
    monster_2_level_lost: monster2 ? monster2.level : '',
    monster_2_abilities_lost: monster2 ? monster2.abilities : '',
    monster_3_id_lost: monster3 ? monster3.card_detail_id : '',
    monster_3_level_lost: monster3 ? monster3.level : '',
    monster_3_abilities_lost: monster3 ? monster3.abilities : '',
    monster_4_id_lost: monster4 ? monster4.card_detail_id : '',
    monster_4_level_lost: monster4 ? monster4.level : '',
    monster_4_abilities_lost: monster4 ? monster4.abilities : '',
    monster_5_id_lost: monster5 ? monster5.card_detail_id : '',
    monster_5_level_lost: monster5 ? monster5.level : '',
    monster_5_abilities_lost: monster5 ? monster5.abilities : '',
    monster_6_id_lost: monster6 ? monster6.card_detail_id : '',
    monster_6_level_lost: monster6 ? monster6.level : '',
    monster_6_abilities_lost: monster6 ? monster6.abilities : ''
  };
};

let date = new Date();
let dateStr = date.toISOString().split("T")[1];
let isInit = false;

if (dateStr && dateStr.startsWith("08:30:")) {
  console.log("--------topBattleUser.saveBattlesHistory---------")
  topBattleUser.saveBattlesHistory();
}

if (dateStr && dateStr.startsWith("08:40:")) {
  isInit = true;
}

if (dateStr && dateStr.startsWith("08:50:")) {
  isInit = true;
}

console.log("get data isInit :", isInit, dateStr, dateStr.split(":")[1])

let fromScore = 800;
let newTopBattleUsers = []
let format = "wild"
let remainUsers = []
let remainFile = null;

format = "modern";
newTopBattleUsers = modern_newTopBattleUsers;
remainUsers = remainUsersModern;
remainFile = remainFileModern;

if (dateStr.split(":")[1].startsWith("0") || dateStr.split(":")[1].startsWith(
    "2")
    || dateStr.split(":")[1].startsWith("4")) {
  format = "wild";
  newTopBattleUsers = wild_newTopBattleUsers;
  remainUsers = remainUsersWild;
  remainFile = remainFileWild;
  fromScore = 1200;
}

console.log("date ----:", dateStr,"format: " ,format, newTopBattleUsers.length)

let battlesList = [];
const usersToGrab = intUsers;

const concatArr = usersToGrab.concat(newTopBattleUsers);
// 排重
let map = new Map();
let mergeArray = [];

if (isInit) {
  console.log('init collectdata begin ........');
  for (let i = 0; i < concatArr.length; i++) {
    if (!map.has(concatArr[i])) {
      map.set(concatArr[i], true);
      mergeArray.push(concatArr[i].trim());
    }
  }
  console.log('concatArr :' + concatArr.length,
      ' usersToGrab : ' + usersToGrab.length,
      ' newTopBattleUsers: ' + newTopBattleUsers.length);
  console.log('mergeArray length : ' + mergeArray.length);
} else {
  console.log('remain collectdata begin ........', remainUsers.length);
  for (let i = 0; i < remainUsers.length; i++) {
    if (!map.has(remainUsers[i])) {
      map.set(remainUsers[i], true);
      mergeArray.push(remainUsers[i].trim());
    }
  }
}

let extendArray = [];
let count = 0;
let delta = 100;
let batchCount = 5;


async function collectData(arr) {
  console.log('batch count started : ', new Date().toLocaleTimeString(),
      ' arr:' + arr.length, 'battlesCnt:', battlesList.length);

  for (let i = 0; i <arr.length ; i++) {
    await  getBattleHistoryRaw(arr[i],format)
    .then(checkBattles => {
      // console.log("----checkbattles---",checkBattles.length)
      return checkAndSave(checkBattles)
    }).catch((error) => {
      console.log(error);
    })
  }
  // let battles = arr.map(user =>
  //     getBattleHistoryRaw(user,format)
  //     .then(checkBattles => checkAndSave(checkBattles)).catch((error) => {
  //       console.log(error);
  //     })
  // );
  // await battles;
  count++;
  mergeArray = mergeArray.concat(extendArray);
  console.log('batch count : ', count, 'battlesCnt:', battlesList.length,
      'extendArray : ', extendArray.length,
      'remainArray :', mergeArray.length);
  extendArray = [];
  console.log(new Date().toLocaleTimeString());
  const cleanBattleList = battlesList.filter(x => x != undefined);
  await saveDatas(cleanBattleList, mergeArray);
  console.log('batch count : ', count, "finished............", "mergeArray:",mergeArray.length)

  if (mergeArray.length >= delta && count < batchCount) {
    setTimeout(async () => await collectData(mergeArray.splice(0, delta)),
        1000 * (1 + Math.random() * 5));
    console.log(new Date().toLocaleTimeString());
  } else {
    dbUtil.pool.end(function (err) {
      // 所有的连接都已经被关闭
    });
    dbUtil.pool.end(function (err) {
      // 所有的连接都已经被关闭
    });
    console.log("*************finished***********", "mergeArray:",mergeArray.length)
    throw new Error('************finished**********');
    return;
  }
}

async function checkAndSave(battles) {
  if (battles) {
    // console.log(battles[0])
    // console.log(battles[0].is_surrender == false,"--",battles[0].details)
    let mapResult = battles.map(
        battle => {
          const details = battle.details;
          // const details = JSON.parse(battle.details);

          if (battle.is_surrender == false ) {
            if (battle.winner && battle.winner == battle.player_1) {
              const monstersDetails = extractMonster(details.team1);
              const lostMonstersDetails = extractMonsterLost(details.team2);
              const info = extractGeneralInfo(battle);
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_1,
                player_rating_initial: battle.player_1_rating_initial,
                player_rating_final: battle.player_1_rating_final,
                winner: battle.player_1,
                ...lostMonstersDetails,
                battle_queue_id_lost: battle.battle_queue_id_1,
                player_rating_initial_lost: battle.player_1_rating_initial,
                player_rating_final_lost: battle.player_1_rating_final,
                loser: battle.player_2,
                format: battle.format
              };
            } else if (battle.winner && battle.winner
                == battle.player_2) {
              const monstersDetails = extractMonster(details.team2);
              const lostMonstersDetails = extractMonsterLost(details.team1);
              const info = extractGeneralInfo(battle);
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_2,
                player_rating_initial: battle.player_2_rating_initial,
                player_rating_final: battle.player_2_rating_final,
                winner: battle.player_2,
                ...lostMonstersDetails,
                battle_queue_id_lost: battle.battle_queue_id_1,
                player_rating_initial_lost: battle.player_1_rating_initial,
                player_rating_final_lost: battle.player_1_rating_final,
                loser: battle.player_1,
                format: battle.format
              };
            }
          }

          if (battle.player_1_rating_initial >= fromScore) {
            if (!map.has(battle.player_1)) {
              map.set(battle.player_1, true);
              extendArray.push(battle.player_1.trim());
            }
          }
          if (battle.player_2_rating_initial >= fromScore) {
            if (!map.has(battle.player_2)) {
              map.set(battle.player_2, true);
              extendArray.push(battle.player_2.trim());
            }
          }
        });
    battlesList = [...battlesList, ...mapResult];
    // console.log("--------11----------22------")
  } else {
    console.log('-------------------error---and save');
    const cleanBattleList = battlesList.filter(x => x != undefined);
    await saveDatas(cleanBattleList, mergeArray);
    dbUtil.pool.end(function (err) {
      // 所有的连接都已经被关闭
    });
    throw new Error('Network response was not ok');
  }
}

async function saveDatas(battlesList, mergeArray) {
  if (battlesList.length > 0) {
    console.log('batchInsert---start---', battlesList.length,
        new Date().toLocaleTimeString(),"FORMAT:",format);
    try {
      await dbUtil.batchInsertRaw(battlesList, fromScore, 500, '2021-11-01');
    } catch (e) {
      console.log('batchInsert---error---',e);
    }
    battlesList = [];
    console.log('batchInsert---end---', battlesList.length,
        new Date().toLocaleTimeString());

    if (mergeArray.length > 0) {
      fs.writeFileSync(remainFile, JSON.stringify(mergeArray), function (err) {
        if (err) {
          console.log(err);
        }
        console.log(remainFile, '----save remainFile--end--');
      });
    }
  }
}

(async () => {
  await collectData(mergeArray.splice(0, delta));
})()
