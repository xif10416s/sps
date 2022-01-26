require('dotenv').config();
const card = require('./cards');
const helper = require('./helper');
const battles = require('./battles');
const fetch = require('node-fetch');
const extendsHandler = require("./data/strategy/extendsHandler")
const preferCs = require('./data/strategy/preferCs')

const cardsDetail = require('./data/cardsDetails');

const enemy = require('./src/enemy/enemy');

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
  {130: 'dragon'}];

const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon'];

const getSummoners = (myCards, splinters) => {
  try {
    const sumArray = summoners.map(x => Number(Object.keys(x)[0]));
    const mySummoners = myCards.filter(
        value => sumArray.includes(Number(value)));
    const myAvailableSummoners = mySummoners.filter(
        id => splinters.includes(summonerColor(id)));
    const singleSummoners = []
    myAvailableSummoners.forEach(sm => {
      if(singleSummoners.indexOf(sm) == -1){
        singleSummoners.push(sm)
      }
    })
    return singleSummoners || mySummoners;
  } catch (e) {
    console.log(e);
    return [];
  }
};


const getSplintersSummoners = (splinters) =>{
  try {
    const sumArray = summoners.map(x => Number(Object.keys(x)[0]));
    const availableSummoners = sumArray.filter(
        id => splinters.includes(summonerColor(id)));
    return availableSummoners;
  } catch (e) {
    console.log(e);
    return [];
  }

}

const summonerColor = (id) => {
  const summonerDetails = summoners.find(x => x[id]);
  return summonerDetails ? summonerDetails[id] : '';
};

// const historyBackup = require("./data/history/newHistory.json")
// .filter( x => x['created_date'].split("T")[0]  > '2021-12-01');

const dbUtils = require('./db/script/dbUtils');
let historyBackup = [];

const basicCards = require('./data/basicCards.js');

let availabilityCheck = (base, toCheck) => toCheck.slice(0, 7).every(
    v => base.includes(v));
let account = '';

const fs = require('fs');
let date = new Date().getTime();

const file = fs.createWriteStream('./logs/'+ process.env.ACCOUNT  +"/" + date + '.txt');
let logger = new console.Console(file, file);

// ### 融合点
const selectBattleDate = async (mana, ruleset, summoners, mustSingleRule) => {
  let keyRules = ruleset.split('|');
  const highMana = 40;
  let rs = [];
  let date = new Date();
  let endDate = new Date(date.setDate(date.getDate() + 2))
  let endDateStr = endDate.toISOString().split("T")[0];
  let startDate = new Date(date.setDate(date.getDate() - 30 ))
  let startDateStr = startDate.toISOString().split("T")[0];
  if (keyRules.length > 1) {
    let sql = 'select * from battle_history_raw_v2 where  mana_cap = ?  and summoner_id in (?)  and (ruleset = ? or ruleset = ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    let params = [mana, summoners, ruleset, keyRules[1] + "|" + keyRules[0],
      endDateStr,startDateStr];
    if(mana > highMana) {
        sql = 'select * from battle_history_raw_v2 where  mana_cap >= '+ highMana +' and  mana_cap <= ?  and summoner_id in (?)  and (ruleset = ? or ruleset = ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    }
    let data = await dbUtils.sqlQuery(sql, params);
    let string = JSON.stringify(data);
    rs = JSON.parse(string);
    console.log("1.1 full match rs :" + rs.length, params, sql)
    // logger.log("1.1 full match rs :" + rs.length, params, sql)
    if (mustSingleRule != null && mustSingleRule == "ALL") {
      if(rs.length >=100){
        return rs;
      } else {
        if(process.env.WEAK_KEY_RULES.indexOf(keyRules[0]) != -1) {
          mustSingleRule= keyRules[1];
        }
        if(process.env.WEAK_KEY_RULES.indexOf(keyRules[1]) != -1) {
          mustSingleRule= keyRules[0];
        }
        console.log("1.1.1 full match less 100 , filter weak rule :" ,mustSingleRule, ruleset)
      }
    }
  } else {
    let sql = 'select * from battle_history_raw_v2 where  mana_cap = ?  and summoner_id in (?)  and ruleset = ? and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    if(mana > highMana) {
        sql = 'select * from battle_history_raw_v2 where mana_cap >=  '+ highMana + ' and mana_cap <= ?  and summoner_id in (?)  and ruleset = ? and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    }
    let data = await dbUtils.sqlQuery(sql,
        [mana, summoners, ruleset, endDateStr,startDateStr]);
    let string = JSON.stringify(data);
    rs = JSON.parse(string);
    console.log("1.2 full match rs :" + rs.length)
    if (mustSingleRule != null && mustSingleRule == "ALL") {
      console.log("1.2 full match  mustSingleRule rs :" + rs.length)
      // logger.log("1.2 full match  mustSingleRule rs :" + rs.length)
      return rs;
    }
  }

  let leastCnt = 5000;
  if (rs.length <= leastCnt && keyRules.length > 1) {
    if (mustSingleRule != null) {
      console.log("mustSingleRule.. :", mustSingleRule)
      let sql = 'select * from battle_history_raw_v2 where  mana_cap = ?  and summoner_id in (?)  and ruleset like ? and created_date_day <= ? and created_date_day >= ?  limit 1000000 ';
      if(mana > highMana) {
        sql = 'select * from battle_history_raw_v2 where  mana_cap >= '+  highMana + '  and mana_cap<= ?  and summoner_id in (?)  and ruleset like ? and created_date_day <= ? and created_date_day >= ?  limit 1000000';
      }
      let params = [mana, summoners, "%" + mustSingleRule + "%", endDateStr,startDateStr]
      let data = await dbUtils.sqlQuery(sql,params);
      let string = JSON.stringify(data);
      let rs2 = rs.concat(JSON.parse(string));
      console.log("2 mustsingeRule match : ", mustSingleRule, "org rule:",
          ruleset, rs2.length ,params, sql)
      // logger.log("2 mustsingeRule match : ", mustSingleRule, "org rule:",
      //     ruleset, rs2.length,params, sql)
      return rs2;
    }

    let sql = 'select * from battle_history_raw_v2 where  mana_cap = ?  and summoner_id in (?)  and ( ruleset like ?  or ruleset like ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    if(mana > highMana) {
      sql = 'select * from battle_history_raw_v2 where  mana_cap >= '+ highMana +' and mana_cap <= ?  and summoner_id in (?)  and ( ruleset like ?  or ruleset like ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    }
    let params = [mana, summoners, keyRules[0] + "%", keyRules[1] + "%", endDateStr,startDateStr]
    let data = await dbUtils.sqlQuery(sql, params);
    let string = JSON.stringify(data);
    let rs3 = rs.concat(JSON.parse(string));
    console.log("3 singlerule match : ", ruleset, rs3.length ,params , sql);
    // logger.log("3 singlerule match : ", ruleset, rs3.length, params, sql);
    return rs3;
  } else {
    console.log("1.0 full match :", rs.length)
    return rs;
  }
}

const battlesFilterByManacap = async (mana, ruleset, summoners) => {
  let orgMana = mana;
  let mustRule = null;
  let keyRules = ruleset.split('|');
  if (keyRules.length > 1) {
    if (process.env.KEY_SINGLE_RULES.indexOf(keyRules[0]) != -1 &&
        process.env.KEY_SINGLE_RULES.indexOf(keyRules[1]) == -1) {
      mustRule = keyRules[0];
    }

    if (process.env.KEY_SINGLE_RULES.indexOf(keyRules[0]) == -1 &&
        process.env.KEY_SINGLE_RULES.indexOf(keyRules[1]) != -1) {
      mustRule = keyRules[1];
    }

    if (process.env.KEY_SINGLE_RULES.indexOf(keyRules[0]) != -1 &&
        process.env.KEY_SINGLE_RULES.indexOf(keyRules[1]) != -1) {
      mustRule = "ALL";
    }
  } else {
    if(process.env.KEY_SINGLE_RULES.indexOf(ruleset) != -1 ){
      mustRule = "ALL";
    }
  }

  console.log("1-1 first step select data start..", mana, ruleset, mustRule,
      summoners)
  let rs = await selectBattleDate(mana, ruleset, summoners, mustRule)
  console.log(1, mana, rs.length);
  console.log("1-1 first step select data end..", rs.length)
  if (rs.length <= 1000) {
    mana = mana - 1;
    rs = rs.concat(await selectBattleDate(mana, ruleset, summoners, mustRule))
    if (rs.length > 100) {
      console.log("1-2 first step select data less 100 mana -1 select ..", mana,
          rs.length)
      // console.log(2, mana, rs.length);
      return rs;
    }

    if (rs.length == 0 && mustRule == null) {
      let sql = 'select * from battle_history_raw_v2 where  mana_cap = ?  and summoner_id in (?)  limit 50000';
      console.log(sql);
      const data3 = await dbUtils.sqlQuery(sql, [orgMana, summoners]);
      let string3 = JSON.stringify(data3);
      rs = JSON.parse(string3);
      console.log("1-3 first step select data no rules.", orgMana, rs.length)
      return rs;
    }
  } else {
    console.log("1-1 first step orgMana match  select data over 1000. ", mana,
        rs.length)
    return rs;
  }
};

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
const cardsIdsforSelectedBattles = (mana, ruleset, splinters,
    summoners) => battlesFilterByManacap(mana, ruleset, summoners)
.then(x => {
  return x.map(
      (x) => {
        // console.log("cardsIdsforSelectedBattles:" + JSON.stringify(x))
        return [
          x.summoner_id && parseInt(x.summoner_id) != -1 ? parseInt(
              x.summoner_id) : '',
          x.monster_1_id && parseInt(x.monster_1_id) != -1 ? parseInt(
              x.monster_1_id) : '',
          x.monster_2_id && parseInt(x.monster_2_id) != -1 ? parseInt(
              x.monster_2_id) : '',
          x.monster_3_id && parseInt(x.monster_3_id) != -1 ? parseInt(
              x.monster_3_id) : '',
          x.monster_4_id && parseInt(x.monster_4_id) != -1 ? parseInt(
              x.monster_4_id) : '',
          x.monster_5_id && parseInt(x.monster_5_id) != -1 ? parseInt(
              x.monster_5_id) : '',
          x.monster_6_id && parseInt(x.monster_6_id) != -1 ? parseInt(
              x.monster_6_id) : '',
          summonerColor(x.summoner_id) ? summonerColor(x.summoner_id) : '',
          x.tot ? parseInt(x.tot) : '',
          x.ratio ? parseInt(x.ratio) : '',
          x.battle_queue_id
        ];
      }
  ).filter(
      team => splinters.includes(team[7])
  ).sort(compare);
});

const askFormation = function (matchDetails) {

  const cards = matchDetails.myCards || basicCards;

  const mySummoners = getSummoners(cards, matchDetails.splinters);
  matchDetails.mySummoners = mySummoners;
  console.log('INPUT: ', matchDetails.mana, matchDetails.rules,
      matchDetails.splinters, cards.length, JSON.stringify(mySummoners));
  // logger.log('INPUT: ', matchDetails.mana, matchDetails.rules,
  //     matchDetails.splinters, cards.length, JSON.stringify(mySummoners));
  return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules,
      matchDetails.splinters, mySummoners)
  .then(x => x.filter(
      x => availabilityCheck(cards, x))
      .map(element => element)//cards.cardByIds(element)
  );

};

/**
 *  规则不匹配，都没匹配
 * @param matchDetails
 * @param acc
 * @returns {Promise<Array>}
 */
const possibleTeams = async (matchDetails, acc) => {
  let possibleTeams = [];
  // while (matchDetails.mana > 10) {
  //   // 99 有 ，13-46
  //   if (matchDetails.mana <= 98 && matchDetails.mana >= 50) {
  //     matchDetails.mana = 50;
  //   }
  //   console.log('check battles based on mana: ' + matchDetails.mana);
  //   account = acc;
  //   possibleTeams = await askFormation(matchDetails);
  //   if (possibleTeams.length >= 5) {
  //     return possibleTeams;
  //   }
  //   matchDetails.mana--;
  // }
  console.log('check battles based on mana: ' + matchDetails.mana);
  possibleTeams = await askFormation(matchDetails);
  return possibleTeams;
};

const mostWinningSummonerTankCombo = async (possibleTeams, matchDetails) => {
  doManaStat(possibleTeams,matchDetails,"mostWinningSummonerTankCombo")
  console.log("4-1 third step most winnning team start :", possibleTeams.length)
  let bestCombination = await battles.mostWinningSummonerTank(possibleTeams);
  // logger.log("4-2 third step most bestcombination  :", JSON.stringify(bestCombination))

  if(process.env.skip_cs && process.env.skip_cs == "false"){
    console.log("4-4-1 third step makeBestCombineByCs  start ............",new Date())
    const byCsTeams = await  makeBestCombineByCs(possibleTeams,matchDetails,bestCombination.bestSummoner);
    if(byCsTeams != null &&  byCsTeams[1] && byCsTeams[1].length > 0 ) {
      let byCsCombine = await battles.mostWinningSummonerTank(byCsTeams[1]);
      const makeBestCombineByCsTeam = await findBestTeam(byCsCombine, byCsTeams[1])
      console.log("4-4-1 third step makeBestCombineByCsTeam  used ............",new Date())
      // logger.log("4-4-1 third step makeBestCombineByCsTeam  used ............",new Date())
      return makeBestCombineByCsTeam;
    }

    console.log("4-4-2 third step makeBestCombine  start ............",new Date())
    const bcTeams = await  makeBestCombine(possibleTeams,matchDetails,bestCombination.bestSummoner);
    if(bcTeams && bcTeams.length > 0 ){
      let bcCombine = await battles.mostWinningSummonerTank(bcTeams);
      const mostWinningBcTeam = await findBestTeam(bcCombine, bcTeams)
      console.log("4-4-2 third step makeBestCombine  used ............",new Date())
      // logger.log("4-4-2 third step makeBestCombine  used ............",new Date())
      return mostWinningBcTeam;
    }
  } else {
    console.log("4-4 third step skip  makeBestCombine")
  }

  const mostWinningSummonerTankComboTeam = await findBestTeam(bestCombination,
      possibleTeams)
  doManaStat(possibleTeams,matchDetails,"findBestTeam")

  // if(matchDetails.orgMana <=19){
  const mst = mostWinningSummonerTankComboTeam[1];
  console.log("mostWinningSummonerTankComboTeam : ", JSON.stringify(mst))
  // const againstMostWin = await battles.findAgainstTeam(mst[0], mst.slice(1, 7),
  //     possibleTeams)
  // if (againstMostWin && againstMostWin.length > 20) {
  //   bestCombination = await battles.mostWinningSummonerTank(againstMostWin);
  //   const revert = await findBestTeam(bestCombination, possibleTeams)
  //   console.log("do revert ,ORG :",
  //       JSON.stringify(mostWinningSummonerTankComboTeam[1]), " TO : ",
  //       JSON.stringify(revert))
  //   // logger.log("4-5 third step  revert againstMostWinTeam team  :", JSON.stringify(revert))
  //   matchDetails['logContent']['strategy'] = "revert"
  //   return revert;
  // } else {
  //   console.log("no revert team")
  // }
  // }

  console.log("4-6 third step  base most winTeam team  :", JSON.stringify(mostWinningSummonerTankComboTeam))
  matchDetails['logContent']['strategy'] = "mts"
  return mostWinningSummonerTankComboTeam;
};

async function findBestTeam(bestCombination, possibleTeams) {
  const sortArr = []
  possibleTeams.forEach(tm =>{
    sortArr.push([calcTotalMana(tm),tm]);
  })
  let sorted = sortArr.sort((a, b) => b[0] - a[0]);
  possibleTeams = sorted.map(s => s[1])
  // console.log('BEST SUMMONER and TANK', bestCombination , possibleTeams.length);
  // logger.log('BEST SUMMONER and TANK', bestCombination, possibleTeams.length);
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins
      > 1 && bestCombination.thirdBacklineWins > 1
      && bestCombination.forthBacklineWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2] == bestCombination.bestBackline
            && x[3] == bestCombination.bestSecondBackline && x[4]
            == bestCombination.bestThirdBackline && x[5]
            == bestCombination.bestForthBackline);
    // console.log('BEST TEAM', bestTeam);
    // logger.log('BEST TEAM', bestTeam);
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
            == bestCombination.bestThirdBackline);
    // console.log('BEST TEAM', bestTeam);
    // logger.log('BEST TEAM', bestTeam);
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins
      > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2] == bestCombination.bestBackline
            && x[3] == bestCombination.bestSecondBackline);
    // console.log('BEST TEAM', bestTeam);
    // logger.log('BEST TEAM', bestTeam);
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2]
            == bestCombination.bestBackline);
    // console.log('BEST TEAM', bestTeam);
    // logger.log('BEST TEAM', bestTeam);
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank);
    // console.log('BEST TEAM', bestTeam);
    // logger.log('BEST TEAM', bestTeam);
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner);
    // console.log('BEST TEAM', bestTeam);
    // logger.log('BEST TEAM', bestTeam);
    if (bestTeam && bestTeam.length > 0) {
      const summoner = bestTeam[0].toString();
      return [summoner, bestTeam];
    }

  }
}

function calcTotalMana(team) {
  let totalMana = 0 ;
  team.slice(0,7).forEach(item =>{
    if(cardsDetail.cardsDetailsIDMap[item]){
      totalMana +=parseInt(cardsDetail.cardsDetailsIDMap[item]['statSum1']['mana'])
    }
  })
  return totalMana;
}

function doManaStat(teams,matchDetails,tag){
  let maxMana = 0 ;
  let minMana = 99;
  let manaMap = {}
  teams.forEach(ft => {
    let totalMana = calcTotalMana(ft)
    if(manaMap[totalMana]){
      manaMap[totalMana]=manaMap[totalMana]+1
    } else {
      manaMap[totalMana] = 1
    }
    if(totalMana >= maxMana){
      maxMana = totalMana;
    }
    if(totalMana <= minMana){
      minMana = totalMana;
    }
    if(maxMana > matchDetails.mana) {
      // console.log("filterOutUnplayableDragonsAnfUnplayableSplinters exception : ",maxMana , matchDetails.mana, ft)
    }
  })

  console.log(tag ,maxMana , minMana, matchDetails.mana , manaMap)
  // logger.log(tag ,maxMana , minMana , matchDetails.mana , manaMap)
  return maxMana;
}

const filterOutUnplayableDragonsAnfUnplayableSplinters = (teams = [],
    matchDetails) => {
  const filteredTeamsForAvailableSplinters = Array.isArray(teams)
      && teams.filter(
          team => (team[7] !== 'dragon' && matchDetails.splinters.includes(
              team[7])) || (team[7] === 'dragon'
              && matchDetails.splinters.includes(
                  helper.teamActualSplinterToPlay(
                      team?.slice(0, 6)).toLowerCase())));
  const filteredTeams =  filteredTeamsForAvailableSplinters || teams;
  console.log("filterOutUnplayableDragonsAnfUnplayableSplinters :",filteredTeams.length)
  // logger.log("filterOutUnplayableDragonsAnfUnplayableSplinters :",filteredTeams.length)
  // big mana or rule:Little League etc...
  let maxMana = doManaStat(filteredTeams,matchDetails,"filterOutUnplayableDragonsAnfUnplayableSplinters before filter")

  if(maxMana > matchDetails.mana) {
    maxMana = matchDetails.mana
  }

  const delta = parseInt(maxMana) <=43 ? 2 : 5;
  let resultTeams =   filteredTeams.filter(ft => {
    let totalMana =  calcTotalMana(ft)
    return parseInt(maxMana) -  parseInt(totalMana) <= delta ;
  })

  console.log("filterOutUnplayableDragonsAnfUnplayableSplinters resultTeams : ",resultTeams.length , delta)
  doManaStat(resultTeams,matchDetails,"filterOutUnplayableDragonsAnfUnplayableSplinters after filter")
  if(resultTeams.length <= 1000) {
    return filteredTeamsForAvailableSplinters || teams;
  } else {
    return resultTeams;
  }
};

//"snipe" "sneak"
function doSpecialQuest(matchDetails,quest , availableTeamsToPlay , tQuest , left , limitCnt){
  let rs = availableTeamsToPlay;
  if(quest.splinter == tQuest && left > 0) {
    const filteredTeamsForQuest = availableTeamsToPlay.filter(
        team => {
          let isMatchSnipe = false;
          team.slice(1,7).forEach(cardId =>{
            const cardInfo = cardsDetail.cardsDetailsIDMap[cardId]
            if(cardInfo) {
              const abilities = cardInfo['abilities']
              let compareQuest = "snipe" == tQuest ?  "Snipe" : "Sneak"
              if(abilities && abilities[0].length  > 0 && abilities[0].indexOf(compareQuest) != -1){
                isMatchSnipe = true
              }
            }
          });
          return isMatchSnipe;
        });
    console.log("2-3-2-1",left + ' battles left for the  ', tQuest , filteredTeamsForQuest.length);
    if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length > limitCnt ) {
      console.log("2-3-2",left + ' battles left for the  ', tQuest , filteredTeamsForQuest.length);
      // logger.log("2-3-2", left + ' battles left for the  ', tQuest , filteredTeamsForQuest.length);
      rs = filteredTeamsForQuest;
      matchDetails['logContent']['QuestMatch'] = quest.splinter +":" + rs.length
    } else {
      console.log('CHECK FOR snipe QUEST skip: ',
          filteredTeamsForQuest.length);
      // logger.log('CHECK FOR snipe QUEST skip: ',
      //     filteredTeamsForQuest.length);
    }
  }
  return rs;
}

const teamSelection = async (possibleTeams, matchDetails, quest,
    favouriteDeck) => {
  let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false
      : true;
  console.log('quest custom option set as:', priorityToTheQuest);
  console.log("2-1 second step teamSelection start ...possibleteam len :",
      possibleTeams.length)
  let availableTeamsToPlay = await filterOutUnplayableDragonsAnfUnplayableSplinters(
      possibleTeams, matchDetails);

  console.log( "2-2 second step teamSelection after filger dragons ...availableTeamsToPlay len :",
      availableTeamsToPlay.length);
  // logger.log(
  //     "2-2 second step teamSelection after filger dragons ...availableTeamsToPlay len :",
  //     availableTeamsToPlay.length)
  // TODO
  if (availableTeamsToPlay && availableTeamsToPlay.length == 0) {

  }

  // check for enemy
  if (process.env.CONSIDER_ENEMY === 'true' && matchDetails.enemyRecent
      && matchDetails.enemyRecent.length > 0) {
    let enemyPossbileTeams = [];
    // map
    console.log(
        "2-3 second step teamSelection collect enemy teams, recent teams:",
        matchDetails.enemyRecent.length)
    const manaRange = getManaRange(matchDetails)
    let manaMatchTeams = enemy.filterManaMatch(matchDetails.enemyRecent,
        matchDetails.orgMana, manaRange[0],manaRange[1] , matchDetails.splinters);
    if (manaMatchTeams && manaMatchTeams.length > 0) {
      let manaRuleMatchTeams = enemy.filterRuleMatch(manaMatchTeams,
          matchDetails.rules);
      console.log("manaMatchTeams-------", manaMatchTeams.length);
      console.log("manaRuleMatchTeams-------", manaRuleMatchTeams.length);
      if (manaRuleMatchTeams && manaRuleMatchTeams.length > 0) {
        enemyPossbileTeams = manaRuleMatchTeams;
      }
    }
    // if (enemyPossbileTeams.length == 0) {
    //   let manaMatchTeams2 = enemy.filterManaMatch(matchDetails.enemyRecent,
    //       matchDetails.orgMana, 2, matchDetails.splinters);
    //   if (manaMatchTeams2 && Object.keys(manaMatchTeams2).length > 0) {
    //     let manaRuleMatchTeams2 = enemy.filterRuleMatch(manaMatchTeams2,
    //         matchDetails.rules);
    //     if (manaRuleMatchTeams2 && manaRuleMatchTeams2.length > 0) {
    //       enemyPossbileTeams = manaRuleMatchTeams2;
    //     }
    //   }
    // }

    console.log('enemyPossbileTeams : ', enemyPossbileTeams.length);
    // logger.log(
    //     "2-3 second step teamSelection collect enemy teams, enemyPossbileTeams",
    //     enemyPossbileTeams.length)
    matchDetails['enemyPossbileTeams'] = enemyPossbileTeams;
    matchDetails['enemySplinterTeams'] = manaMatchTeams;
  }

  //CHECK FOR QUEST:
  matchDetails['logContent']['QuestMatch'] = "skip"
  if (priorityToTheQuest && availableTeamsToPlay.length > 30000 && quest
      && quest.total) {
    const left = quest.total - quest.completed;
    const questCheck = matchDetails.splinters.includes(quest.splinter) && left
        > 0;
    if(questCheck) {
      const filteredTeamsForQuest = availableTeamsToPlay.filter(
          team => team[7] === quest.splinter);
      console.log("2-3-1",left + ' battles left for the splinter' + quest.splinter + ' quest');
      // logger.log("2-3-1", left + ' battles left for the splinter' + quest.splinter + ' quest')
      console.log("2-3-1",'play for the quest splinter', quest.splinter, '? ', questCheck);

      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length > 10000
          && splinters.includes(quest.splinter)) {
        console.log('Try to play for the quest with Teams size (V1): ',
            filteredTeamsForQuest.length);
        // logger.log('Try to play for the quest with Teams size (V1): ',
        //     filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter +":" + availableTeamsToPlay.length
      } else {
        console.log('CHECK FOR QUEST skip: ',
            filteredTeamsForQuest.length);
        // logger.log('CHECK FOR QUEST skip: ',
        //     filteredTeamsForQuest.length);
      }
    }

    // sprinter neutral
    if(quest.splinter == "neutral" && left > 0) {
      let rules=  matchDetails.rules.split("|")
      let replaceRule = matchDetails.rules;
      if(rules.length > 1){
        if(process.env.KEY_SINGLE_RULES.indexOf(rules[0]) == -1 && process.env.WEAK_KEY_RULES.indexOf(rules[0]) == -1
        && rules[1] != "Taking Sides"){
            rules[0] = "Taking Sides"
        }

        if(process.env.KEY_SINGLE_RULES.indexOf(rules[1]) == -1 && process.env.WEAK_KEY_RULES.indexOf(rules[1]) == -1
            && rules[0] != "Taking Sides"){
          rules[1] = "Taking Sides"
        }
        replaceRule = rules.join("|");
      } else {
        if(process.env.KEY_SINGLE_RULES.indexOf(matchDetails.rules) == -1 && process.env.WEAK_KEY_RULES.indexOf(matchDetails.rules) == -1
            && matchDetails.rules != "Taking Sides"){
          replaceRule  = "Taking Sides"
        }
      }
      if(replaceRule != matchDetails.rules){
        console.log("2-3-2",left + ' battles left for the neutral org:' + matchDetails.rules + ' to ', replaceRule);
        // logger.log("2-3-2", left + ' battles left for the neutral org:' + matchDetails.rules + ' to' , replaceRule);
        matchDetails.rules = replaceRule;
        matchDetails['logContent']['QuestMatch'] = quest.splinter +":Taking Sides"
      } else {
        console.log('CHECK FOR QUEST skip: ',
            matchDetails.rules);
        // logger.log('CHECK FOR QUEST skip: ',
        //     matchDetails.rules);
      }
    }

    // sprinter snipe
    availableTeamsToPlay = doSpecialQuest(matchDetails,quest,availableTeamsToPlay,"snipe",left , 10000)

    //  "sneak"
    availableTeamsToPlay = doSpecialQuest(matchDetails,quest,availableTeamsToPlay,"sneak",left , 5000)

  }

  //CHECK for Favourite DECK TODO
  // const favDeckfilteredTeams = availableTeamsToPlay.filter(
  //     team => team[7] === favouriteDeck);
  // if (favDeckfilteredTeams?.length && favouriteDeck
  //     && matchDetails.splinters.includes(favouriteDeck?.toLowerCase())) {
  //   console.log('play splinter:', favouriteDeck, 'from ',
  //       favDeckfilteredTeams?.length, 'teams from V1');
  //   if (favDeckfilteredTeams && favDeckfilteredTeams?.length >= 1
  //       && favDeckfilteredTeams[0][0]) {
  //     const res = await mostWinningSummonerTankCombo(favDeckfilteredTeams,
  //         matchDetails);
  //     if (res[0] && res[1]) {
  //       console.log('play this as favourite deck for V1:',calcTotalMana(res[1]), res[1].join("-") );
  //       return {summoner: res[0], cards: res[1]};
  //     } else {
  //       console.log('not enough teams for the favourite deck (V1)');
  //     }
  //   }
  //   console.log('No possible teams for splinter ', favouriteDeck, ' V1');
  // }

  const res = await mostWinningSummonerTankCombo(availableTeamsToPlay,
      matchDetails);
  if (res[0] && res[1]) {
    console.log('Dont play for the quest, and play this:', res);
    res[1] = extendsHandler.doExtendsHandler(res[1], matchDetails.rules,
        matchDetails.myCards, matchDetails.splinters);
    console.log('Dont play for the quest, and play this doExtendsHandler realMana:',calcTotalMana(res[1]),' match mana :',matchDetails.mana, res[1].join("-") );
    console.log('final team mana:'+ calcTotalMana(res[1]), ' matchMana:',matchDetails.mana, res[1].join("-") );
    return {summoner: res[0], cards: res[1]};
  }
  console.log('No available team to be played...');
  return null;
};

const teamSelectionForWeb = async (possibleTeams, matchDetails) => {
  //matchDetails.mySummoners
  possibleTeams = await filterOutUnplayableDragonsAnfUnplayableSplinters(
      possibleTeams, matchDetails);

  let bestCombination = await battles.mostWinningSummonerTank(possibleTeams);
  const mostWinningSummonerTankComboTeam = await findBestTeam(bestCombination,
      possibleTeams)

  // ----
  let enemyPossbileTeams = [];
  let mostEnemyAgainstTeam = [];
  if (matchDetails.enemyRecent && matchDetails.enemyRecent.length > 0) {
    const manaRange = getManaRange(matchDetails)
    let manaMatchTeams = enemy.filterManaMatch(matchDetails.enemyRecent,
        matchDetails.orgMana, manaRange[0],manaRange[1] , matchDetails.splinters);
    if (manaMatchTeams && manaMatchTeams.length > 0) {
      let manaRuleMatchTeams = enemy.filterRuleMatch(manaMatchTeams,
          matchDetails.rules);
      // console.log("-------", JSON.stringify(manaMatchTeams));
      // console.log("-------", JSON.stringify(manaRuleMatchTeams));
      if (manaRuleMatchTeams && manaRuleMatchTeams.length > 0) {
        enemyPossbileTeams = manaRuleMatchTeams;
      }
    }


    matchDetails['enemyPossbileTeams'] = enemyPossbileTeams;
    matchDetails['enemySplinterTeams'] = matchDetails.enemyRecent;
    console.log('enemyPossbileTeams : ', enemyPossbileTeams.length)
  }

  // by card cs
  let mostWinningBcTeam = []
  // if(process.env.skip_cs && process.env.skip_cs == "false"){
    console.log("makeBestCombine  start ............")
    const bcTeams = await  makeBestCombine(possibleTeams,matchDetails,bestCombination.bestSummoner);
    let bcCombine = await battles.mostWinningSummonerTank(bcTeams);
    mostWinningBcTeam = await findBestTeam(bcCombine, bcTeams)
    console.log("makeBestCombine  end ............")
  // }
  console.timeLog("battle","2 makeBestCombine finished")

  let makeBestCombineByCsTeam = []
  const byCsTeams = await  makeBestCombineByCs(possibleTeams,matchDetails,bestCombination.bestSummoner);
  if(byCsTeams != null) {
      let byCsCombine = await battles.mostWinningSummonerTank(byCsTeams[1]);
      makeBestCombineByCsTeam = await findBestTeam(byCsCombine, byCsTeams[1])
   }

  console.timeLog("battle","3 makeBestCombineByCs finished")

  let mostAgainstrevertTeam = [];
  const mst = mostWinningSummonerTankComboTeam[1];
  // console.log("mostWinningSummonerTankComboTeam : ", JSON.stringify(mst))
  // const againstMostWin = await battles.findAgainstTeam(mst[0], mst.slice(1, 7),
  //     possibleTeams)
  // if (againstMostWin && againstMostWin.length > 0) {
  //   bestCombination = await battles.mostWinningSummonerTank(againstMostWin);
  //   mostAgainstrevertTeam = await findBestTeam(bestCombination, possibleTeams)
  //   console.log("do revert ,ORG :",
  //       JSON.stringify(mostWinningSummonerTankComboTeam[1]), " TO : ",
  //       JSON.stringify(mostAgainstrevertTeam))
  // } else {
  //   console.log("no revert team")
  // }



  let summonerTeamMap = {};
  for (var i = 0; i < matchDetails.mySummoners.length; i++) {
    var mySummoner = matchDetails.mySummoners[i];
    var filterTeams = possibleTeams.filter(x => x[0] == mySummoner);
    let bestCombination = await battles.mostWinningSummonerTank(filterTeams);
    const mostWinningSummonerTankComboTeam = await findBestTeam(bestCombination,
        filterTeams)
    if (mostWinningSummonerTankComboTeam
        && mostWinningSummonerTankComboTeam.length > 0) {
      summonerTeamMap[mySummoner] = extendsHandler.doExtendsHandler(mostWinningSummonerTankComboTeam[1], matchDetails.rules, matchDetails.myCards, matchDetails.splinters);
    }

  }

  let recentEenmyTeam = []
  if (matchDetails['enemyRecent'] && matchDetails['enemyRecent'].length > 0) {
    var recentBattles = matchDetails['enemyRecent'].filter(x => {
      return x['mana_cap'] >= parseInt(matchDetails.orgMana) - 3
          && x['mana_cap'] <= parseInt(matchDetails.orgMana) + 1
    });
    let len = recentBattles.length > 10 ? 10 : recentBattles.length;
    recentEenmyTeam = recentBattles.slice(0,len).map(b => {
      return [getCardNameByID(b['summoner_id']),
        getCardNameByID(b['monster_1_id']), getCardNameByID(b['monster_2_id'])
        , getCardNameByID(b['monster_3_id']),
        getCardNameByID(b['monster_4_id']), getCardNameByID(b['monster_5_id']),
        getCardNameByID(b['monster_6_id']), '', b['mana_cap'], b['isWin'],
        b['ruleset']]
    })
  }
  const mostWinTeam = extendsHandler.doExtendsHandler(
      mostWinningSummonerTankComboTeam
      && mostWinningSummonerTankComboTeam.length > 1
          ? mostWinningSummonerTankComboTeam[1] : []
      , matchDetails.rules, matchDetails.myCards, matchDetails.splinters);
  const enemyAgainstTeam = extendsHandler.doExtendsHandler(
      mostEnemyAgainstTeam && mostEnemyAgainstTeam.length > 1
          ? mostEnemyAgainstTeam[1] : []
      , matchDetails.rules, matchDetails.myCards, matchDetails.splinters);
  const againstrevertTeam = extendsHandler.doExtendsHandler(
      mostAgainstrevertTeam && mostAgainstrevertTeam.length > 1
          ? mostAgainstrevertTeam[1] : []
      , matchDetails.rules, matchDetails.myCards, matchDetails.splinters);

  let possbiletEnemyTeam = []
  if(matchDetails['enemyPossbileTeams'] && matchDetails['enemyPossbileTeams'].length > 0){
    possbiletEnemyTeam = matchDetails['enemyPossbileTeams'].map(team => {
      try {
        return [getCardNameByID(team['summoner_id']),
          getCardNameByID(team['monster_1_id']),
          getCardNameByID(team['monster_2_id'])
          , getCardNameByID(team['monster_3_id']),
          getCardNameByID(team['monster_4_id']),
          getCardNameByID(team['monster_5_id']),
          getCardNameByID(team['monster_6_id']), '', team['mana_cap'], '-',
          team['ruleset']]
      } catch (e) {

      }
    })
  }

  let enemyMostCsTeam = []
  if(byCsTeams != null){
    byCsTeams[0].forEach(cs => {
      enemyMostCsTeam.push(cs.split("-").map(x => getCardNameByID(x)))
    })
  }


  const mostBcTeam = extendsHandler.doExtendsHandler(
      mostWinningBcTeam
      && mostWinningBcTeam.length > 1
          ? mostWinningBcTeam[1] : []
      , matchDetails.rules, matchDetails.myCards,matchDetails.splinters);

  const mostByCsTeam = extendsHandler.doExtendsHandler(
      makeBestCombineByCsTeam
      && makeBestCombineByCsTeam.length > 1
          ? makeBestCombineByCsTeam[1] : []
      , matchDetails.rules, matchDetails.myCards,matchDetails.splinters);
  console.timeEnd("battle")
  return {
    mostWinTeam: mostWinTeam,
    mostEnemyAgainstTeam: enemyAgainstTeam,
    mostAgainstrevertTeam: againstrevertTeam,
    summoners: summonerTeamMap,
    recentEenmyTeam: [...enemyMostCsTeam,...possbiletEnemyTeam],
    mostBcTeam:mostBcTeam,
    mostByCsTeam: mostByCsTeam
  }
}

function getCardNameByID(cardId) {
  let card = cardsDetail.cardsDetailsIDMap[cardId];
  if (card) {
    return card['name']
  } else {
    // console.log(cardId," not found ...")
    return ""
  }

}

function getManaRange(matchDetails){
  let delta = 0 ;
  if(matchDetails.mana <= 17){
    delta = 0
  }
  if(matchDetails.mana >= 18 && matchDetails.mana <= 28){
    delta = 1
  }
  if(matchDetails.mana >= 29 && matchDetails.mana <= 35){
    delta = 2
  }
  if(matchDetails.mana >= 36 && matchDetails.mana <= 44){
    delta = 3
  }

  let fromMana = matchDetails.mana >= 45 ? 45 :  parseInt(matchDetails.mana) - parseInt(delta) ;
  let endMana = parseInt(matchDetails.mana) + parseInt(delta) ;
  return [fromMana,endMana]
}
async  function initCSTeams(possibleTeams, matchDetails,matchSplintersSummoners ) {
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];

  if(matchSplintersSummoners && matchSplintersSummoners.length == 0){
    return [];
  }
  console.log("makeBestCombine select  : " , matchSplintersSummoners)
  // logger.log("makeBestCombine select  : " , matchSplintersSummoners)
  const myAviableSummoners = getSummoners(matchDetails.myCards,matchDetails.splinters)
  let sql = "select cs , sum(teams)/sum(teams+lostTeams) as tl   from   battle_stat_v3 where ( " ;
  let csLike = "";
  for (var i = 0; i < myAviableSummoners.length; i++) {
    if(i != 0) {
      csLike+=" or "
    }
    csLike+="cs like '"+ myAviableSummoners[i] + "%'";
  }
  csLike+=" ) and "
  sql+=csLike;
  sql+=" summonerId in ( " + matchSplintersSummoners.join(",") + ") and "
  let mustRules = battles.getMustRules(matchDetails.rules);
  if(mustRules  == "ALL") {
    let keyRules = mustRules.split('|');
    let reserveRule = keyRules[1] + "|" + keyRules[0]
    sql += "( rule = '" +mustRules +"' or rule = '" + reserveRule +"' )  and "
  } else if(mustRules == "" || mustRules == "ANY") {
    sql += " rule = 'default'  and "
  } else {
    sql += " rule = '"+mustRules+"'  and "
  }
  sql += "  startMana >="+ fromMana +" and startMana <= "+ endMana +"   GROUP BY cs  HAVING    tl >0.75   and sum(totalcnt - lostTotalCnt) >100  order by len asc ,  sum(teams -lostTeams ) desc , tl desc "
  const data = await dbUtils.sqlQuery(sql);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('makeBestCombine', rs.length, sql);
  return rs;
}

async  function initPerferCSTeams(possibleTeams, matchDetails,matchSplintersSummoners ) {
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];

  if(matchSplintersSummoners && matchSplintersSummoners.length == 0){
    return [];
  }
  console.log("initPerferCSTeams select  : " , matchSplintersSummoners)
  // logger.log("initPerferCSTeams select  : " , matchSplintersSummoners)
  const myAviableSummoners = getSummoners(matchDetails.myCards,matchDetails.splinters)
  let sql = "select cs , sum(teams)/sum(teams+lostTeams) as tl   from   battle_stat_v3 where ( " ;
  let csLike = "";
  for (var i = 0; i < myAviableSummoners.length; i++) {
    if(i != 0) {
      csLike+=" or "
    }
    csLike+="cs like '"+ myAviableSummoners[i] + "%'";
  }
  csLike+=" ) and  ("
  sql+=csLike;
  const preferLike = preferCs.map(cs => {
    return  "cs like '" + cs + "' "
  }).join(" or ")
  sql += preferLike
  sql+=") and summonerId in ( " + matchSplintersSummoners.join(",") + ") and "
  let mustRules = battles.getMustRules(matchDetails.rules);
  if(mustRules  == "ALL") {
    let keyRules = mustRules.split('|');
    let reserveRule = keyRules[1] + "|" + keyRules[0]
    sql += "( rule = '" +mustRules +"' or rule = '" + reserveRule +"' )  and "
  } else if(mustRules == "" || mustRules == "ANY") {
    sql += " rule = 'default'  and "
  } else {
    sql += " rule = '"+mustRules+"'  and "
  }
  sql += "  startMana >="+ fromMana +" and startMana <= "+ endMana +"   GROUP BY cs  order by len asc ,  sum(teams -lostTeams ) desc , tl desc "
  const data = await dbUtils.sqlQuery(sql);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('initPerferCSTeams', rs.length, sql);
  return rs;
}

async  function makeBestCombine(possibleTeams, matchDetails, mostSummoner = null) {
  let matchSplintersSummoners  = battles.matchedEnemyPossbileSummoners(matchDetails['enemyPossbileTeams'],true);
  if(mostSummoner){
    matchSplintersSummoners.push(mostSummoner)
  }

  let rs = await initPerferCSTeams(possibleTeams,matchDetails,matchSplintersSummoners)
  let matchCS = matchCsTeam(rs,possibleTeams)
  console.log('1 makeBestCombine initPerferCSTeams do enemy full rule match : ', matchCS[1].length);
  let isMatchPrefer = true;
  if(matchCS && matchCS[1].length == 0){
    rs = await initCSTeams(possibleTeams,matchDetails,matchSplintersSummoners)
    matchCS = matchCsTeam(rs,possibleTeams)
    console.log('2 makeBestCombine initCSTeams do enemy full rule match : ', matchCS[1].length);
    isMatchPrefer = false;
  }


  if(matchCS[1].length  <= 0 && matchDetails['enemyPossbileTeams'] && matchDetails['enemySplinterTeams'] &&  matchDetails['enemyPossbileTeams'].length < matchDetails['enemySplinterTeams'].length) { //TODO
     matchSplintersSummoners = battles.matchedEnemyPossbileSummoners(matchDetails['enemySplinterTeams'],false);
    if(mostSummoner){
      matchSplintersSummoners.push(mostSummoner)
    }

    rs = await initPerferCSTeams(possibleTeams,matchDetails,matchSplintersSummoners)
    matchCS = matchCsTeam(rs,possibleTeams)
    console.log('3 makeBestCombine initPerferCSTeams do enemy full rule match : ', matchCS[1].length);
    isMatchPrefer = true;
    if(matchCS && matchCS[1].length == 0){
      rs = await initCSTeams(possibleTeams,matchDetails,matchSplintersSummoners)
      matchCS = matchCsTeam(rs,possibleTeams)
      console.log('4 makeBestCombine do enemy splinters match : ', matchCS[1].length);
      isMatchPrefer = false;
    }
  }

  let cs =   matchCS[0]
  let matchTeams = matchCS[1]
  if(matchCS && cs.length > 0 && matchTeams.length > 0){
    console.log("----",JSON.stringify( matchTeams.length))
    let next = true;
    while(next){
      let extendsResult = await extendsCombineSearch(cs,matchTeams,matchDetails,matchSplintersSummoners)
      if(extendsResult[1] && extendsResult[1].length > 0) {
        cs = extendsResult[0];
        matchTeams = extendsResult[1]
      }else {
        next = false;
      }
    }
  }
  console.log("--makeBestCombine--final--",cs,JSON.stringify( matchTeams.length))
  if(matchTeams != null &&  matchTeams.length > 0 ) {
    matchDetails['logContent']['strategy'] = "ByEnemySM:"+ isMatchPrefer + ":" + matchTeams.length
  }
  return matchTeams;
}


function splitCS(lead, t,a) {
  if (t.length >= 2) {
    let bs = lead + "-" + t[0]
    for (let i = 1; i < t.length - 1; i++) {
      let s = bs + "-" + t[i]
      a.push(s)
    }
  }
  if (t.length >= 3) {
    let bs2 = lead + "-" + t[0] + "-" + t[1]
    for (let i = 2; i < t.length - 1; i++) {
      let s = bs2 + "-" + t[i]
      a.push(s)
    }
  }
  if (t.length >= 4) {
    let bs3 = lead + "-" + t[0] + "-" + t[1] + "-" + t[2]
    for (let i = 3; i < t.length - 1; i++) {
      let s = bs3 + "-" + t[i]
      a.push(s)
    }
  }
  if (t.length >= 3) {
    splitCS(lead, t.slice(1, t.length), a)
  }
}

async function selectCsLs(sql, params) {
  const data = await dbUtils.sqlQuery(sql,params);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('makeBestCombineV2', rs.length, sql , params);
  return rs;
}

function sortByPreferCsOrder(rs) {
  if(process.env.PREFER_CS == "false") {
    return rs;
  }
  let sortRs = []
  const collectList = []
  preferCs.forEach(cs => {
    const cardIds = cs.split("%")
    rs.forEach( item => {
      const itemIds = item['cs'].split("-")
      const interceptIds = cardIds.filter(function(v){ return itemIds.indexOf(v) > -1 })
      if(interceptIds.length == cardIds.length - 1){
        if(collectList.indexOf(item['cs']) == -1){
          sortRs.push(item)
          collectList.push(item['cs'])
        }
      }
    })
  })
  sortRs = sortRs.concat(rs.filter(x => {
    return sortRs.find(sr => sr['cs'] == x['cs']) == null
  }))
  if(sortRs.length >=3){
    console.log("sortByPreferCsOrder:",rs.length ,sortRs.length , sortRs.slice(0,3))
  }
  return sortRs;
}

async  function makeBestCombineByCs(possibleTeams, matchDetails, mostSummoner = null) {
  let teamCs = []
  const ept = matchDetails['enemyPossbileTeams']
  if(ept == null || ept.length == 0  ){
    return null;
  }
  ept.forEach(t => {
      const leader = t['summoner_id'];
      const teams = [t['monster_1_id'],t['monster_2_id'],t['monster_3_id'],t['monster_4_id'],t['monster_5_id'],t['monster_6_id']].filter(x => x!="" && parseInt(x) !=-1)
      teams.sort((a,b) => a - b )
      splitCS(leader,teams,teamCs)
  })
  let maxLen = 0;
  let c = teamCs.reduce((pre ,value ) =>{
    if(value.split("-").length > maxLen) {
      maxLen = value.split("-").length;
    }
    if(value in pre){
      pre[value]++;
    }else {
      pre[value]=1;
    }
    return pre;
  },{})
  let sorted  = Object.entries(c).filter(x => x[0].split("-").length >= maxLen -1 ).sort((a, b) => {
    return b[1] -a[1]
  }).map(x => x[0])

  const sIdMap = {}
  const selectSortedCS = []
  let topSummoners  = battles.matchedEnemyPossbileSummoners(matchDetails['enemyPossbileTeams'],true);
  if(topSummoners && topSummoners.length >0){
    topSummoners.forEach( sId =>{
      sorted.forEach(cs =>{
        if( sIdMap[sId] == null){
          sIdMap[sId] = 0
        }
        if(cs.startsWith(sId.toString()) ){
          if(sIdMap[sId] <=2){
            selectSortedCS.push(cs)
            sIdMap[sId]+=1
          }
        }
      })
    })
  }

  const len = selectSortedCS.length >= 10 ? 10 : selectSortedCS.length
  const topCs = selectSortedCS.slice(0,len).sort((a,b) => b.length - a.length )
  console.log(topSummoners, topCs)
  if(topCs && topCs.length == 0){
    return null
  }

  const matchSplintersSummoners = {}
  topCs.forEach(x => matchSplintersSummoners[x.split("-")[0]] = true )

  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];
  let mustRules = battles.getMustRules(matchDetails.rules);
  let matchRule =  matchDetails.rules;
  if(mustRules  == "ALL") {
    let keyRules = mustRules.split('|');
    matchRule = keyRules.sort((a1,a2) => a1.localeCompare(a2) ).join("|")
  } else if(mustRules == "" || mustRules == "ANY") {
    matchRule = 'default'
  } else {
    matchRule = mustRules
  }
  const params = [fromMana,endMana,matchRule];

  const topCsLikeSql = topCs.map( cs => {
    return   " lcs like '" + cs.replaceAll("-","%")+"%' "
  }).join(" or ")

  console.log("--prefercs--",preferCs)
  const preferSql = preferCs.map(cs => {
    return  "wcs like '" + cs + "' "
  }).join(" or ")

  let isMatchPrefer = true;
  let sqlPrefer = " select  wcs as cs ,count(*) as cnt  from battle_stat_cs_ls_v3 where startMana >= ? and startMana <= ? and rule = ? and  ("+ topCsLikeSql +")  and (" + preferSql  +") group by wcs order by   cnt desc , count asc  " ;
  let rs = await selectCsLs(sqlPrefer,params)
  let matchCS = matchCsTeam(rs,possibleTeams)
  if(matchCS == null ||  matchCS[1].length == 0){
    let sql = " select  wcs as cs ,count(*) as cnt  from battle_stat_cs_ls_v3 where startMana >= ? and startMana <= ? and rule = ? and ("+ topCsLikeSql  +")   group by wcs order by   cnt desc , count asc    limit 5000" ;
    rs = await selectCsLs(sql,params)
    matchCS = matchCsTeam(rs,possibleTeams)
    isMatchPrefer = false;
  }
  let cs =   matchCS[0]
  let matchTeams = matchCS[1]
  if(matchCS && cs.length > 0 && matchTeams.length > 0){
    console.log("----",JSON.stringify( matchTeams.length))
    let next = true;
    while(next){
      let extendsResult = await extendsCombineSearch(cs,matchTeams,matchDetails,Object.keys(matchSplintersSummoners))
      if(extendsResult[1] && extendsResult[1].length > 0) {
        cs = extendsResult[0];
        matchTeams = extendsResult[1]
      }else {
        next = false;
      }
    }
  }
  console.log("--makeBestCombineByCs--final--",cs,JSON.stringify( matchTeams.length))
  if(matchTeams != null &&  matchTeams.length > 0 ) {
    matchDetails['logContent']['strategy'] = "ByEnemyCs:"+ isMatchPrefer + ":" + matchTeams.length
  }
  return [topCs,matchTeams];
}

function matchCsTeam(rs , possibleTeams) {
  rs = sortByPreferCsOrder(rs)
  let matchTeams = [];
  let matchCs = "";
  if(rs && rs.length > 0){
    for (var i = 0; i < rs.length; i++) {
      const cs = rs[i]['cs']
      const teamCS =  cs.split("-")
      matchTeams = possibleTeams.filter( pt =>{ // must
        let isMatch = true;
        teamCS.slice(1,teamCS.length).forEach(csCard =>{
          if(pt.indexOf(parseInt(csCard)) == -1){
            isMatch = false;
          }
        })
        return  pt[0] == teamCS[0] && isMatch
      })
      if(matchTeams && matchTeams.length > 0){
        matchCs = cs;
        console.log(i,cs,rs[i]['tl'] ? rs[i]['tl'] :   rs[i]['cnt'])
        console.log("matchTeams .......",matchTeams.length)
        break;
      }
    }
  }
  return [matchCs,matchTeams];
}



async function extendsCombineSearch(cs , matchTeams,matchDetails,matchSplintersSummoners){
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];
  let sql = "select cs , sum(teams)/sum(teams+lostTeams) as tl   from   battle_stat_v3 where  " ;
  let csLike = "cs like '";
  let spCs =  cs.split("-")
  spCs.slice(2,spCs.length).forEach(itemCs =>{
    cs = cs.replace(itemCs,"%"+itemCs+"%")
  })
  csLike +=cs
  csLike+="'  and "
  sql+=csLike;
  sql+=" summonerId in ( " + matchSplintersSummoners.join(",") + ") and "
  let mustRules = battles.getMustRules(matchDetails.rules);
  if(mustRules  == "ALL") {
    let keyRules = mustRules.split('|');
    let matchRules = keyRules.sort((a1,a2) => a1.localeCompare(a2) ).join("|")
    sql += " rule = '" +matchRules +"' )  and "
  } else if(mustRules == "" || mustRules == "ANY") {
    sql += " rule = 'default'  and "
  } else {
    sql += " rule = '"+mustRules+"'  and "
  }
  sql += "len > "+ (spCs.length - 1)  +" and startMana >="+ fromMana +" and startMana <= "+endMana  +"   GROUP BY cs   order by   tl desc  ,sum(teams -lostTeams ) desc "
  const data = await dbUtils.sqlQuery(sql);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('extendsCombineSearch',rs, sql);
  return matchCsTeam(rs, matchTeams)
}

module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;
module.exports.getSummoners = getSummoners;
module.exports.getSplintersSummoners=getSplintersSummoners;
module.exports.teamSelectionForWeb = teamSelectionForWeb
module.exports.logger = logger;
module.exports.summoners = summoners;

// selectBattleDate(23,"Standard",