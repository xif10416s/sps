const fetch = require('node-fetch');
const fs = require('fs');

const newTopBattleUsers = require('./data/initUsers/topBattleUser');
const intUsers = require('./data/initUsers/init');
const remainUsers = require('./data/remain');

const distinct = (value, index, self) => {
  return self.indexOf(value) === index;
};

const {sleep} = require('./helper');

async function getBattleHistory(player = '', data = {}) {
  try {
    const battleHistory = await fetch(
        'https://api2.splinterlands.com/battle/history?player=' + player)
        .then((response) => {
          if (!response.ok) {
            fs.writeFile(remainFile, JSON.stringify(mergeArray), function(err) {
              if (err) {
                console.log(err);
              }
              const cleanBattleList = battlesList.filter(x => x != undefined);
              const rsJson = JSON.stringify(cleanBattleList);
              fs.writeFile(fileName, rsJson, function(err) {
                if (err) {
                  console.log(err);
                }
                throw new Error('Network response was not ok');
              });
            });
          }
          return response;
        })
        .then((battleHistory) => {
          return battleHistory.json();
        })
        .catch((error) => {
          console.error('There has been a problem with your fetch operation:',
              error);
        });
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

let isInit = false;
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
let count = 1;
let delta = 100;
let batchCount = 10;
let fileName = `data/history8.json`;
let remainFile = `data/remain.json`;

function collectData(arr) {
  console.log(new Date(), ' arr:' + JSON.stringify(arr));
  let battles = arr.map(user =>
      getBattleHistory(user)
          .then(checkBattles => checkAndSave(checkBattles))
      //     .then(battles =>
      //     battles.map(
      //         battle => {
      //           const details = JSON.parse(battle.details);
      //           if (details.type != 'Surrender') {
      //             if (battle.winner && battle.winner == battle.player_1) {
      //               const monstersDetails = extractMonster(details.team1);
      //               const info = extractGeneralInfo(battle);
      //               return {
      //                 ...monstersDetails,
      //                 ...info,
      //                 battle_queue_id: battle.battle_queue_id_1,
      //                 player_rating_initial: battle.player_1_rating_initial,
      //                 player_rating_final: battle.player_1_rating_final,
      //                 winner: battle.player_1
      //
      //               };
      //             } else if (battle.winner && battle.winner
      //                 == battle.player_2) {
      //               const monstersDetails = extractMonster(details.team2);
      //               const info = extractGeneralInfo(battle);
      //               return {
      //                 ...monstersDetails,
      //                 ...info,
      //                 battle_queue_id: battle.battle_queue_id_2,
      //                 player_rating_initial: battle.player_2_rating_initial,
      //                 player_rating_final: battle.player_2_rating_final,
      //                 winner: battle.player_2
      //               };
      //             }
      //           }
      //           if (!map.has(battle.player_1)) {
      //             map.set(battle.player_1, true);
      //             extendArray.push(battle.player_1.trim());
      //           }
      //
      //           if (!map.has(battle.player_2)) {
      //             map.set(battle.player_2, true);
      //             extendArray.push(battle.player_2.trim());
      //           }
      //         })
      // ).then(x => battlesList = [...battlesList, ...x])
  );

  Promise.all(battles).then(() => {
    count++;
    mergeArray = mergeArray.concat(extendArray);
    console.log('batch count : ', count, 'extendArray : ', extendArray.length,
        'remainArray :', mergeArray.length);
    extendArray = [];
    if (mergeArray.length >= delta && count <= batchCount) {
      console.log(new Date());
      setTimeout(() => collectData(mergeArray.splice(0, delta)), 1000 * (1 + Math.random() * 1));
      console.log(new Date());
    } else {
      fs.writeFile(remainFile, JSON.stringify(mergeArray), function(err) {
        if (err) {
          console.log(err);
        }
      });
      const cleanBattleList = battlesList.filter(x => x != undefined);
      const rsJson = JSON.stringify(cleanBattleList);
      fs.writeFile(fileName, rsJson, function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

function checkAndSave(battles) {
  if (battles) {
    let mapResult = battles.map(
        battle => {
          const details = JSON.parse(battle.details);
          if (details.type != 'Surrender') {
            if (battle.winner && battle.winner == battle.player_1) {
              const monstersDetails = extractMonster(details.team1);
              const info = extractGeneralInfo(battle);
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_1,
                player_rating_initial: battle.player_1_rating_initial,
                player_rating_final: battle.player_1_rating_final,
                winner: battle.player_1

              };
            } else if (battle.winner && battle.winner
                == battle.player_2) {
              const monstersDetails = extractMonster(details.team2);
              const info = extractGeneralInfo(battle);
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_2,
                player_rating_initial: battle.player_2_rating_initial,
                player_rating_final: battle.player_2_rating_final,
                winner: battle.player_2
              };
            }
          }
          if (!map.has(battle.player_1)) {
            map.set(battle.player_1, true);
            extendArray.push(battle.player_1.trim());
          }

          if (!map.has(battle.player_2)) {
            map.set(battle.player_2, true);
            extendArray.push(battle.player_2.trim());
          }

        });
    battlesList = [...battlesList, ...mapResult]
  } else {
    console.log('-------------------error---and save');
    const cleanBattleList = battlesList.filter(x => x != undefined);
    const rsJson = JSON.stringify(cleanBattleList);
    console.log(fileName, '----save--begin--');
    fs.writeFileSync(fileName, rsJson, function(err) {
      console.log(fileName, '----save--end--');
      if (err) {
        console.log(err);
      }
      console.log(remainFile, '----save--begin--');
    });

    console.log(remainFile, 'mergeArray------', mergeArray.length);
    fs.writeFileSync(remainFile, JSON.stringify(mergeArray), function(err) {
      if (err) {
        console.log(err);
      }
      console.log(remainFile, '----save--end--');
    });
    throw new Error('Network response was not ok');
  }
}

collectData(mergeArray.splice(0, delta));
console.log('------------');
