require('dotenv').config()
const card = require('./cards');
const helper = require('./helper');
const battles = require('./battles');
const fetch = require("node-fetch");

const cardsDetail = require('./data/cardsDetails');


const summoners = [{260: 'fire'},
  {257: 'water'},
  {437: 'water'},
  {224: 'dragon'},
  {189: 'earth'},
  {145: 'death'},
  {240: 'dragon'},
  {167: 'fire'},
  {438: 'death'},
  {156: 'life'},
  {440: 'fire'},
  {114: 'dragon'},
  {441: 'life'},
  {439: 'earth'},
  {262: 'dragon'},
  {261: 'life'},
  {178: 'water'},
  {258: 'death'},
  {27: 'earth'},
  {38: 'life'},
  {49: 'death'},
  {5: 'fire'},
  {70: 'fire'},
  {38: 'life'},
  {73: 'life'},
  {259: 'earth'},
  {74: 'death'},
  {72: 'earth'},
  {442: 'dragon'},
  {71: 'water'},
  {88: 'dragon'},
  {78: 'dragon'},
  {200: 'dragon'},
  {16: 'water'},
  {239: 'life'},
  {254: 'water'},
  {235: 'death'},
  {113: 'life'},
  {109: 'death'},
  {110: 'fire'},
  {291: 'dragon'},
  {278: 'earth'},
  {236: 'fire'},
  {56: 'dragon'},
  {112: 'earth'},
  {111: 'water'},
  {56: 'dragon'},
  {205: 'dragon'},
  {130: 'dragon'}]

const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon']

const getSummoners = (myCards, splinters) => {
  try {
    const sumArray = summoners.map(x => Number(Object.keys(x)[0]))
    const mySummoners = myCards.filter(
        value => sumArray.includes(Number(value)));
    const myAvailableSummoners = mySummoners.filter(
        id => splinters.includes(summonerColor(id)))
    return myAvailableSummoners || mySummoners;
  } catch (e) {
    console.log(e);
    return [];
  }
}

const summonerColor = (id) => {
  const summonerDetails = summoners.find(x => x[id]);
  return summonerDetails ? summonerDetails[id] : '';
}

// const historyBackup = require("./data/history/newHistory.json")
// .filter( x => x['created_date'].split("T")[0]  > '2021-12-01');

const dbUtils = require('./db/script/dbUtils');
let historyBackup = [];

const basicCards = require('./data/basicCards.js');


let availabilityCheck = (base, toCheck) => toCheck.slice(0, 7).every(
    v => base.includes(v));
let account = '';

const fs = require('fs');
let date = new Date().getTime()
const file = fs.createWriteStream('./logs/' + date + '.txt');
let logger = new console.Console(file, file);

// ##### 从服务器获取历史的结果
const getBattlesWithRuleset = (ruleset, mana, summoners) => {
  const rulesetEncoded = encodeURIComponent(ruleset);
  const host = process.env.API || 'http://95.179.236.23/'
  let url = ''
  if (process.env.API_VERSION == 2) {
    url = `V2/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${account}&token=${process.env.TOKEN}&summoners=${summoners
        ? JSON.stringify(summoners) : ''}`;
  } else {
    url = `V1/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${account}&token=${process.env.TOKEN}&summoners=${summoners
        ? JSON.stringify(summoners) : ''}`;
  }
  console.log('API call: ', host + url)
  return fetch(host + url)
  .then(x => x && x.json())
  .then(data => data)
  .catch((e) => console.log('fetch ', e))
}

// ### 融合点
// const battlesFilterByManacap_bak = async (mana, ruleset, summoners,
//     singleMatch) => {
//   // const history = await getBattlesWithRuleset(ruleset, mana, summoners);
//   const history = null;
//   if (history) {
//     console.log('API battles returned ', history.length)
//     return history.filter(
//         battle =>
//             battle.mana_cap == mana &&
//             (ruleset ? battle.ruleset === ruleset : true)
//     )
//   }
//   const backupLength = historyBackup && historyBackup.length
//   console.log('API battles did not return ', history)
//   console.log('Using Backup ', backupLength)
//
//   if (ruleset && singleMatch != null && singleMatch == true) {
//     let keySingleRules = process.env.KEY_SINGLE_RULES;
//     return historyBackup.filter(
//         battle => {
//           let keyRules = ruleset.split('|')
//           // .filter(rule => keySingleRules.indexOf(rule) != -1)
//           let match = false;
//           keyRules.forEach(keyRule => {
//              if(battle.ruleset.indexOf(keyRule)  != -1 ){
//                match = true;
//              }
//           } )
//           battle.mana_cap == mana && match
//         }
//     )
//   } else {
//     return historyBackup.filter(
//         battle =>
//             battle.mana_cap == mana &&
//             (ruleset ? battle.ruleset === ruleset : true)
//     )
//   }
// }

// ### 融合点
const battlesFilterByManacap = async (mana, ruleset, summoners,
    singleMatch) => {

  let sql = 'select * from battle_history where  mana_cap = '+ mana +'  and ruleset = "' +  ruleset.trim() + '"';
  if (ruleset && singleMatch != null && singleMatch == true) {
    let keyRules = ruleset.split('|')
    if(keyRules.length >=2) {
      console.log("dbUtils.sqlQuery singleMatch  match ")
       sql = 'select * from battle_history where  mana_cap = '+ mana +'  and  (ruleset like "%'+keyRules[0]+'%" or ruleset like "%'+keyRules[1]+'%")'
    }
  }
  console.log(sql)
  const data = await dbUtils.sqlQuery(sql);
  let string=JSON.stringify(data);
  const rs =  JSON.parse(string);
  // console.log("dbUtils.sqlQuery match data : "+ string)
  return rs;
}


function compare(a, b) {
  const totA = a[9];
  const totB = b[9];

  let comparison = 0;
  if (totA < totB) {
    comparison = 1;
  } else if (totA > totB) {
    comparison = -1;
  }
  return comparison;
}

// #888#选择卡片
const cardsIdsforSelectedBattles = (mana, ruleset, splinters, summoners,
    singleMatch) => battlesFilterByManacap(mana, ruleset, summoners,
    singleMatch)
.then(x => {
  return x.map(
      (x) => {
        // console.log("cardsIdsforSelectedBattles:" + JSON.stringify(x))
        return [
          x.summoner_id && parseInt(x.summoner_id) != -1 ? parseInt(x.summoner_id)  : '',
          x.monster_1_id && parseInt(x.monster_1_id) != -1 ? parseInt(x.monster_1_id) : '',
          x.monster_2_id && parseInt(x.monster_2_id) != -1 ? parseInt(x.monster_2_id) : '',
          x.monster_3_id && parseInt(x.monster_3_id) != -1 ? parseInt(x.monster_3_id) : '',
          x.monster_4_id && parseInt(x.monster_4_id) != -1 ? parseInt(x.monster_4_id) : '',
          x.monster_5_id && parseInt(x.monster_5_id) != -1 ? parseInt(x.monster_5_id) : '',
          x.monster_6_id && parseInt(x.monster_6_id) != -1 ? parseInt(x.monster_6_id) : '',
          summonerColor(x.summoner_id) ? summonerColor(x.summoner_id) : '',
          x.tot ? parseInt(x.tot) : '',
          x.ratio ? parseInt(x.ratio) : '',
        ]
      }
  ).filter(
      team => splinters.includes(team[7])
  ).sort(compare)
})

//  #1# 适配可能队伍
const askFormation = function (matchDetails) {
  // 可用怪物
  const cards = matchDetails.myCards || basicCards;
  // 可用召唤
  const mySummoners = getSummoners(cards, matchDetails.splinters);
  console.log('INPUT: ', matchDetails.mana, matchDetails.rules,
      matchDetails.splinters, cards.length)
  logger.log('INPUT: ', matchDetails.mana, matchDetails.rules,
      matchDetails.splinters, cards.length)
  return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules,
      matchDetails.splinters, mySummoners, matchDetails.singleMatch)
  .then(x => x.filter(
      x => availabilityCheck(cards, x))
      .map(element => element)//cards.cardByIds(element)
  )

}

/**
 *  规则不匹配，都没匹配
 * @param matchDetails
 * @param acc
 * @returns {Promise<Array>}
 */
const possibleTeams = async (matchDetails, acc) => {
  let possibleTeams = [];
  while (matchDetails.mana > 10) {
    // 99 有 ，13-46
    if (matchDetails.mana <= 98 && matchDetails.mana >=50) {
      matchDetails.mana = 50;
    }
    console.log('check battles based on mana: ' + matchDetails.mana);
    account = acc;
    possibleTeams = await askFormation(matchDetails);
    if (possibleTeams.length > 0) {
      return possibleTeams;
    }
    matchDetails.mana--;
  }
  return possibleTeams;
}

const mostWinningSummonerTankCombo = async (possibleTeams, matchDetails) => {
  const bestCombination = await battles.mostWinningSummonerTank(possibleTeams,preferSummoners = matchDetails['preferSummoners'])
  console.log('BEST SUMMONER and TANK', bestCombination)
  logger.log('BEST SUMMONER and TANK', bestCombination)
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins
      > 1 && bestCombination.thirdBacklineWins > 1
      && bestCombination.forthBacklineWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2] == bestCombination.bestBackline
            && x[3] == bestCombination.bestSecondBackline && x[4]
            == bestCombination.bestThirdBackline && x[5]
            == bestCombination.bestForthBackline)
    console.log('BEST TEAM', bestTeam)
    logger.log('BEST TEAM', bestTeam)
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins
      > 1 && bestCombination.thirdBacklineWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2] == bestCombination.bestBackline
            && x[3] == bestCombination.bestSecondBackline && x[4]
            == bestCombination.bestThirdBackline)
    console.log('BEST TEAM', bestTeam)
    logger.log('BEST TEAM', bestTeam)
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins
      > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2] == bestCombination.bestBackline
            && x[3] == bestCombination.bestSecondBackline)
    console.log('BEST TEAM', bestTeam)
    logger.log('BEST TEAM', bestTeam)
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2] == bestCombination.bestBackline)
    console.log('BEST TEAM', bestTeam)
    logger.log('BEST TEAM', bestTeam)
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank)
    console.log('BEST TEAM', bestTeam)
    logger.log('BEST TEAM', bestTeam)
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner)
    console.log('BEST TEAM', bestTeam)
    logger.log('BEST TEAM', bestTeam)
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
}

const filterOutUnplayableDragonsAnfUnplayableSplinters = (teams = [],
    matchDetails) => {
  const filteredTeamsForAvailableSplinters = Array.isArray(teams)
      && teams.filter(
          team => (team[7] !== 'dragon' && matchDetails.splinters.includes(
              team[7])) || (team[7] === 'dragon'
              && matchDetails.splinters.includes(
                  helper.teamActualSplinterToPlay(
                      team?.slice(0, 6)).toLowerCase())))
  return filteredTeamsForAvailableSplinters || teams;
}

const teamSelection = async (possibleTeams, matchDetails, quest,
    favouriteDeck) => {
  // 优先 每日任务 队伍
  let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false
      : true;
  console.log('quest custom option set as:', priorityToTheQuest)
  const availableTeamsToPlay = await filterOutUnplayableDragonsAnfUnplayableSplinters(
      possibleTeams, matchDetails);

  //CHECK FOR QUEST:
  if (priorityToTheQuest && availableTeamsToPlay.length > 10 && quest
      && quest.total) {
    const left = quest.total - quest.completed;
    const questCheck = matchDetails.splinters.includes(quest.splinter) && left
        > 0;
    const filteredTeamsForQuest = availableTeamsToPlay.filter(
        team => team[7] === quest.splinter)
    console.log(left + ' battles left for the ' + quest.splinter + ' quest')
    console.log('play for the quest ', quest.splinter, '? ', questCheck)

    //QUEST FOR V2
    console.log('process.env.API_VERSION : ', process.env.API_VERSION)
    if (process.env.API_VERSION == 2 && availableTeamsToPlay[0][8]) {
      console.log('V2 try to play for the quest?')
      if (left > 0 && filteredTeamsForQuest?.length >= 1 && questCheck
          && filteredTeamsForQuest[0][8]) {
        console.log('PLAY for the quest with Teams choice of size (V2): ',
            filteredTeamsForQuest.length, 'PLAY this: ',
            filteredTeamsForQuest[0])
        return {
          summoner: filteredTeamsForQuest[0][0],
          cards: filteredTeamsForQuest[0]
        };
      } else {
        console.log(
            'quest already completed or not enough teams for the quest (V2)')
      }
    } else if (process.env.API_VERSION != 2 && availableTeamsToPlay[0][0]) {
      // QUEST FOR V1
      console.log('play quest for V1')
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length > 3
          && splinters.includes(quest.splinter)) {
        console.log('Try to play for the quest with Teams size (V1): ',
            filteredTeamsForQuest.length)
        const res = await mostWinningSummonerTankCombo(filteredTeamsForQuest,
            matchDetails);
        if (res[0] && res[1]) {
          console.log('Play this for the quest:', res)
          return {summoner: res[0], cards: res[1]};
        } else {
          console.log('not enough teams for the quest (V1)')
        }
      }
    }
  }

  // check for enemy
  if(process.env.CONSIDER_ENEMY === 'true'){
     logger.log("enemyRecentInfo  matchDetails.enemyRecent: " + JSON.stringify(matchDetails.enemyRecent))
     let enemyRecentInfo = cardsDetail.getEnemyBufferRecentInfo(matchDetails.enemyRecent,'Summoner')
     logger.log("enemyRecentInfo : " + JSON.stringify(enemyRecentInfo))

    // ['17':{},]
     let enemyTeamPerfer = cardsDetail.getEnemyTeamPerfer(matchDetails.enemyRecent,matchDetails.orgMana);
     let perferSummoners = Object.keys(enemyTeamPerfer);
     logger.log("perferSummoners : "+ JSON.stringify(enemyTeamPerfer))
     // if(perferSummoners.length > 0 ){
     //   logger.log("perferSummoners : "+ JSON.stringify(perferSummoners))
     //   let perferSummonersInfo = cardsDetail.getEnemyBufferRecentInfo(perferSummoners.map(summoner => [summoner,"1"]))
     //   logger.log("perferSummonersInfo : " + JSON.stringify(perferSummonersInfo))
     // }

    let suitSummoners = cardsDetail.getSuitBattleSummoner(enemyRecentInfo,perferSummoners)
    logger.log("suitbattleSummoners : " + JSON.stringify(suitSummoners))
    matchDetails['preferSummoners'] = suitSummoners;
  }





  //CHECK for Favourite DECK
  const favDeckfilteredTeams = availableTeamsToPlay.filter(
      team => team[7] === favouriteDeck)
  if (favDeckfilteredTeams?.length && favouriteDeck
      && matchDetails.splinters.includes(favouriteDeck?.toLowerCase())) {
    //FAV DECK FOR V2
    if (process.env.API_VERSION == 2 && availableTeamsToPlay?.[0]?.[8]) {
      console.log('play splinter:', favouriteDeck, 'from ',
          favDeckfilteredTeams?.length, 'teams fro V2')
      if (favDeckfilteredTeams && favDeckfilteredTeams?.length >= 1
          && favDeckfilteredTeams[0][8]) {
        console.log('play this as favourite deck for V2:',
            favDeckfilteredTeams[0])
        return {
          summoner: favDeckfilteredTeams[0][0],
          cards: favDeckfilteredTeams[0]
        };
      }
      console.log('No possible teams for splinter ', favouriteDeck, ' V2')
    } else if (process.env.API_VERSION != 2 && favDeckfilteredTeams[0][0]) {
      // FAV DECK FOR V1
      console.log('play splinter:', favouriteDeck, 'from ',
          favDeckfilteredTeams?.length, 'teams from V1')
      if (favDeckfilteredTeams && favDeckfilteredTeams?.length >= 1
          && favDeckfilteredTeams[0][0]) {

        const res = await mostWinningSummonerTankCombo(favDeckfilteredTeams,
            matchDetails);
        if (res[0] && res[1]) {
          console.log('play this as favourite deck for V1:', res)
          return {summoner: res[0], cards: res[1]};
        } else {
          console.log('not enough teams for the favourite deck (V1)')
        }
      }
      console.log('No possible teams for splinter ', favouriteDeck, ' V1')
    }
  }

  //V2 Strategy ONLY FOR PRIVATE API
  if (process.env.API_VERSION == 2 && availableTeamsToPlay?.[0]?.[8]) {
    if (availableTeamsToPlay?.length) {
      console.log('play the highest winning rate team: ',
          availableTeamsToPlay[0])
      return {
        summoner: availableTeamsToPlay[0][0],
        cards: availableTeamsToPlay[0]
      };
    } else {
      console.log('NO available team to be played for V2');
      return null;
    }
  } else if (process.env.API_VERSION != 2 && availableTeamsToPlay[0][0]) {
    //V1 Strategy
    //find best combination (most used)
    // ######## 最合适
    const res = await mostWinningSummonerTankCombo(availableTeamsToPlay,
        matchDetails);
    if (res[0] && res[1]) {
      console.log('Dont play for the quest, and play this:', res)
      return {summoner: res[0], cards: res[1]};
    }
  }

  console.log('No available team to be played...')
  return null
}

module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;
module.exports.logger = logger;