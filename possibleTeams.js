require('dotenv').config();

const helper = require('./helper');
const battles = require('./battles');
const extendsHandler = require("./data/strategy/extendsHandler")
const preferCs = require('./data/strategy/preferCs')
const cardsDetail = require('./data/cardsDetails');
const enemy = require('./src/enemy/enemy');
const summoners = [
    {260: 'fire'},
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
  {130: 'dragon'},
  {499: 'death'},
  {502: 'life'},
  {501: 'fire'},
  {498: 'water'},
  {500: 'earth'},
  {503: 'dragon'},
  {449: 'death'}];

const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon'];
const request = require('request')
const zero_cards=[366,380,394,408,422]

const getSummoners = (myCards, splinters) => {
  try {
    const sumArray = summoners.map(x => Number(Object.keys(x)[0]));
    const mySummoners = myCards.filter(
        value => sumArray.includes(Number(value)));
    const myAvailableSummoners = mySummoners.filter(
        id => splinters.includes(summonerColor(id)));
    const singleSummoners = []
    myAvailableSummoners.forEach(sm => {
      if (singleSummoners.indexOf(sm) == -1) {
        singleSummoners.push(sm)
      }
    })
    return singleSummoners || mySummoners;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getSplintersSummoners = (splinters) => {
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


const dbUtils = require('./db/script/dbUtils');
const basicCards = require('./data/basicCards.js');
let availabilityCheck = (base, toCheck) => toCheck.slice(0, 7).every(
    v => {
      if (v == "") {
        return true;
      }
      // 0卡存在的 排除 20221022
      if(zero_cards.indexOf(v) != -1) {
         return true;
      }
      return base.includes(v)
    });

const fs = require('fs');
const file = fs.createWriteStream(
    './logs/' + process.env.ACCOUNT + "/" + 1 + '.txt');
let logger = new console.Console(file, file);

// ### 融合点
const selectBattleDate = async (mana, ruleset, summoners, mustSingleRule,
    ranked) => {
  let keyRules = ruleset.split('|');
  let tableName = 'battle_history_raw_v2';
  if (ranked == 'M') {
    tableName = 'battle_history_raw_morden';
  }

  const highMana = 40;
  let rs = [];
  let date = new Date();
  let endDate = new Date(date.setDate(date.getDate() + 2))
  let endDateStr = endDate.toISOString().split("T")[0];
  let startDate = new Date(date.setDate(date.getDate() - 60))
  let startDateStr = startDate.toISOString().split("T")[0];
  if (keyRules.length > 1) {
    let sql = 'select * from ' + tableName
        + ' where  mana_cap = ?  and summoner_id in (?)  and (ruleset = ? or ruleset = ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    let params = [mana, summoners, ruleset, keyRules[1] + "|" + keyRules[0],
      endDateStr, startDateStr];
    if (mana > highMana) {
      sql = 'select * from ' + tableName + ' where  mana_cap >= ' + highMana
          + ' and  mana_cap <= ?  and summoner_id in (?)  and (ruleset = ? or ruleset = ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    }
    let data = await dbUtils.sqlQuery(sql, params);
    let string = JSON.stringify(data);
    rs = JSON.parse(string);
    console.log("1.1 full match rs :" + rs.length, params, sql)
    // logger.log("1.1 full match rs :" + rs.length, params, sql)
    if (mustSingleRule != null && mustSingleRule == "ALL") {
      if (rs.length >= 100) {
        return rs;
      } else {
        if (process.env.WEAK_KEY_RULES.indexOf(keyRules[0]) != -1) {
          mustSingleRule = keyRules[1];
        }
        if (process.env.WEAK_KEY_RULES.indexOf(keyRules[1]) != -1) {
          mustSingleRule = keyRules[0];
        }
        console.log("1.1.1 full match less 100 , filter weak rule :",
            mustSingleRule, ruleset)
      }
    }
  } else {
    let sql = 'select * from ' + tableName
        + ' where  mana_cap = ?  and summoner_id in (?)  and ruleset = ? and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    if (mana > highMana) {
      sql = 'select * from ' + tableName + ' where mana_cap >=  ' + highMana
          + ' and mana_cap <= ?  and summoner_id in (?)  and ruleset = ? and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    }
    let data = await dbUtils.sqlQuery(sql,
        [mana, summoners, ruleset, endDateStr, startDateStr]);
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
      let sql = 'select * from ' + tableName
          + ' where  mana_cap = ?  and summoner_id in (?)  and ruleset like ? and created_date_day <= ? and created_date_day >= ?  limit 1000000 ';
      if (mana > highMana) {
        sql = 'select * from ' + tableName + ' where  mana_cap >= ' + highMana
            + '  and mana_cap<= ?  and summoner_id in (?)  and ruleset like ? and created_date_day <= ? and created_date_day >= ?  limit 1000000';
      }
      let params = [mana, summoners, "%" + mustSingleRule + "%", endDateStr,
        startDateStr]
      let data = await dbUtils.sqlQuery(sql, params);
      let string = JSON.stringify(data);
      let rs2 = rs.concat(JSON.parse(string));
      console.log("2 mustsingeRule match : ", mustSingleRule, "org rule:",
          ruleset, rs2.length, params, sql)
      // logger.log("2 mustsingeRule match : ", mustSingleRule, "org rule:",
      //     ruleset, rs2.length,params, sql)
      return rs2;
    }

    let sql = 'select * from ' + tableName
        + ' where  mana_cap = ?  and summoner_id in (?)  and ( ruleset like ?  or ruleset like ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    if (mana > highMana) {
      sql = 'select * from ' + tableName + ' where  mana_cap >= ' + highMana
          + ' and mana_cap <= ?  and summoner_id in (?)  and ( ruleset like ?  or ruleset like ?) and created_date_day <= ? and created_date_day >= ?  limit 1000000';
    }
    let params = [mana, summoners, keyRules[0] + "%", keyRules[1] + "%",
      endDateStr, startDateStr]
    let data = await dbUtils.sqlQuery(sql, params);
    let string = JSON.stringify(data);
    let rs3 = rs.concat(JSON.parse(string));
    console.log("3 singlerule match : ", ruleset, rs3.length, params, sql);
    // logger.log("3 singlerule match : ", ruleset, rs3.length, params, sql);
    return rs3;
  } else {
    console.log("1.0 full match :", rs.length)
    return rs;
  }
}

const battlesFilterByManacap = async (mana, ruleset, summoners, ranked) => {
  let orgMana = mana;
  let mustRule = null;
  let tableName = 'battle_history_raw_v2';
  if (ranked == 'M') {
    tableName = 'battle_history_raw_morden';
  }
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
    if (process.env.KEY_SINGLE_RULES.indexOf(ruleset) != -1) {
      mustRule = "ALL";
    }
  }

  console.log("1-1 first step select data start..", mana, ruleset, mustRule,
      summoners)
  let rs = await selectBattleDate(mana, ruleset, summoners, mustRule, ranked)
  console.log(1, mana, rs.length);
  console.log("1-1 first step select data end..", rs.length)
  if (rs.length <= 1000) {
    mana = mana - 1;
    rs = rs.concat(
        await selectBattleDate(mana, ruleset, summoners, mustRule, ranked))
    if (rs.length > 100) {
      console.log("1-2 first step select data less 100 mana -1 select ..", mana,
          rs.length)
      // console.log(2, mana, rs.length);
      return rs;
    }

    if (rs.length == 0 && mustRule == null) {
      let sql = 'select * from ' + tableName
          + ' where  mana_cap = ?  and summoner_id in (?)  limit 50000';
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
    summoners, ranked) => battlesFilterByManacap(mana, ruleset, summoners,
    ranked)
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
  return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules,
      matchDetails.splinters, mySummoners, matchDetails.ranked)
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
  console.log('check battles based on mana: ' + matchDetails.mana);
  try {
    possibleTeams = await askFormation(matchDetails);
    console.log("askFormation  possibleTeams :", possibleTeams.length)
  } catch (e) {
    console.log(
        "askFormation   possibleTeams == 0  && matchDetails.ranked == M , do Wild select")
    matchDetails.ranked = "W"
    possibleTeams = await askFormation(matchDetails);
    console.log("askFormation  change Wild select possibleTeams :",
        possibleTeams.length)
  }

  // TODO for mordern combine
  // if (possibleTeams && possibleTeams.length <= 100 && matchDetails.ranked
  //     == "M") {
  //   console.log(" do Wild select merge")
  //   matchDetails.ranked = "W"
  //   possibleTeams = possibleTeams.concat(await askFormation(matchDetails));
  //   console.log("askFormation  change Wild select possibleTeams :",
  //       possibleTeams.length)
  // }
  // remove zero

  possibleTeams = possibleTeams.map(t =>{
    zero_cards.forEach(x => {
      const position =  t.indexOf(x)
      if(position != -1){
        t.splice(position, 1);
        t.splice(6, 0,"");
      }
    })
    return t;
  })
  console.log("askFormation  possibleTeams zero:", possibleTeams.length)
  return possibleTeams;
};

const mostWinningSummonerTankCombo = async (possibleTeams, matchDetails) => {
  doManaStat(possibleTeams, matchDetails, "mostWinningSummonerTankCombo")
  console.log("4-1 third step most winnning team start :", possibleTeams.length)
  let bestCombination = await battles.mostWinningSummonerTank(possibleTeams);
  // logger.log("4-2 third step most bestcombination  :", JSON.stringify(bestCombination))
  // 机器学习
  if(process.env.algorithm && process.env.algorithm == "ml") {
    console.log("4-4-0-0---  doMLPredict--------------")
    const fromRating = process.env.algorithm_rating
    const mlTeamInfo = await doMLPredict(possibleTeams,matchDetails.mana, matchDetails.rating,matchDetails.rules,parseFloat(fromRating),matchDetails['enemyPossbileTeams'],matchDetails['splinters'])
    console.log("4-4-0-0---  doMLPredict--------------:",mlTeamInfo)
    const mlTeam = mlTeamInfo[0]
    if(mlTeam && mlTeam.length >=1) {
      const maxMana =  matchDetails.mana >=52 ? 52 : matchDetails.mana
      if(maxMana - calcTotalMana(mlTeam) <=6) {
        matchDetails['logContent']['strategy'] = "ml"
        matchDetails['logContent']['isMatchPrefer'] = ""
        matchDetails['logContent']['stgLen'] = possibleTeams.length
        matchDetails['logContent']['QuestMatch'] = mlTeamInfo[1]
        return [mlTeam[0],mlTeam];
      }
    }
  }

  if (process.env.skip_cs && process.env.skip_cs == "false") {
    console.log("4-4-0 third step makeBestCombine  start ............",
        new Date())
    let bcTeams = await makeBestCombine(possibleTeams, matchDetails,
        bestCombination.bestSummoner);
    if (bcTeams && matchDetails.rating && (matchDetails.rating <= 1000
        && bcTeams.length >= 10 || matchDetails.rating > 1000 && bcTeams.length
        >= 5)) {
      // let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false
      //     : true;
      // if (priorityToTheQuest) {
      //   bcTeams = doFocusFilter(bcTeams, matchDetails.quest, 1)
      // }
      let bcCombine = await battles.mostWinningSummonerTank(bcTeams);
      const mostWinningBcTeam = await findBestTeam(bcCombine, bcTeams)
      console.log("4-4-0 third step makeBestCombine  used ............",
          new Date())

      return mostWinningBcTeam;
    }

    // console.log("4-4-1 third step makeBestCombineByCs  start ............",
    //     new Date())
    // const byCsTeams = await makeBestCombineByCs(possibleTeams, matchDetails, 5);
    // if (byCsTeams != null && byCsTeams[1] && matchDetails.rating
    //     && (matchDetails.rating <= 1000 && byCsTeams[1].length >= 10
    //         || matchDetails.rating > 1000 && byCsTeams[1].length >= 5)) {
    //   let csTeams = byCsTeams[1];
    //   let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false
    //       : true;
    //   if (priorityToTheQuest) {
    //     csTeams = doFocusFilter(csTeams, matchDetails.quest, 1)
    //   }
    //   let byCsCombine = await battles.mostWinningSummonerTank(csTeams);
    //   const makeBestCombineByCsTeam = await findBestTeam(byCsCombine, csTeams)
    //   console.log("4-4-1 third step makeBestCombineByCsTeam  used ............",
    //       new Date())
    //   // logger.log("4-4-1 third step makeBestCombineByCsTeam  used ............",new Date())
    //   return makeBestCombineByCsTeam;
    // }
  } else {
    console.log("4-4 third step skip  makeBestCombine")
  }

  const mostWinningSummonerTankComboTeam = await findBestTeam(bestCombination,
      possibleTeams)
  doManaStat(possibleTeams, matchDetails, "findBestTeam")

  const mst = mostWinningSummonerTankComboTeam[1];
  console.log("mostWinningSummonerTankComboTeam : ", JSON.stringify(mst))

  console.log("4-6 third step  base most winTeam team  :",
      JSON.stringify(mostWinningSummonerTankComboTeam))
  matchDetails['logContent']['strategy'] = "mts"
  matchDetails['logContent']['isMatchPrefer'] = ""
  matchDetails['logContent']['stgLen'] = possibleTeams.length
  return mostWinningSummonerTankComboTeam;
};

const FOCUS_TYPE = {
  "anti magic": {type: "attack", target: "magic"},
  "anti melee": {type: "attack", target: "attack"},
  "defend": {type: "skill", target: ["Shield", "Repair"]},
  "stealth": {type: "skill", target: ["Sneak", "Snipe", "Opportunity"]},
  "reflect": {
    type: "skill",
    target: ["Backfire", "Return Fire", "Magic Reflect"]
  },
  "buffs": {
    type: "skill",
    target: ["Swiftness", "Inspire", "Protect", "Strengthen"]
  },
  "disable": {type: "skill", target: ["Piercing", "Stun"]},
  "exploits": {
    type: "skill",
    target: ["Oppress", "Giant Killer", "Deathblow", "Knock Out"]
  },
  "fatalities": {
    type: "skill",
    target: ["Bloodlust", "Life Leech", "Redemption", "Scavenger"]
  },
  "healing": {
    type: "skill",
    target: ["Tank Heal", "Heal", "Cleanse", "Triage"]
  },
  "ailments ": {type: "skill", target: ["Poison", "Affliction", "Weaken"]},
  "impair": {type: "skill", target: ["Demoralize", "Silence", "Headwinds"]},
  "nullify": {type: "skill", target: ["Shatter", "Cripple", "Dispel"]}

}

function doFocusFilter(bcTeams, focus, limitCnt) {
  const fcType = FOCUS_TYPE[focus]
  if (fcType == null) {
    console.log("doFocusFilter not match type :", focus)
    return bcTeams;
  }
  console.log("doFocusFilter match type :", focus, fcType, bcTeams.length)
  const type = fcType['type']
  const target = fcType['target']
  const filterTeams = bcTeams.filter(t => {
    if (type == 'attack') {
      return checkAttackMatch(t, target)
    } else {
      return checkSkillMatch(t, target)
    }
  })
  if (filterTeams.length >= limitCnt) {
    console.log("doFocusFilter filtered:", filterTeams.length, bcTeams.length)
    return filterTeams;
  } else {
    console.log("doFocusFilter no filter:", bcTeams.length)
    return bcTeams;
  }
}

function checkAttackMatch(team, target) {
  // console.log("checkAttackMatch : ",target)
  for (let i = 1; i < team.length; i++) {
    const cardInfo = cardsDetail.cardsDetailsIDMap[team[i]]
    if (cardInfo == null) {
      continue;
    }
    // console.log(cardInfo['statSum1'][target],cardInfo['name'])
    if (cardInfo['statSum1'][target] > 0) {
      // console.log("checkAttackMatch :", cardInfo['name'], target)
      return true;
    }
  }
  return false;
}

function checkSkillMatch(team, target) {
  // console.log("checkSkillMatch : ",target)
  for (let i = 1; i < team.length; i++) {
    const cardInfo = cardsDetail.cardsDetailsIDMap[team[i]]
    if (cardInfo == null || cardInfo['abilities'] == null) {
      continue;
    }
    let intersection = cardInfo['abilities'][0].filter(function (val) {
      return target.indexOf(val) > -1
    })
    if (intersection.length > 0) {
      console.log("checkSkillMatch  abilities :", cardInfo['name'],
          intersection)
      return true;
    }
  }
  return false;
}

async function findBestTeam(bestCombination, possibleTeams) {
  const sortArr = []
  possibleTeams.forEach(tm => {
    sortArr.push([calcTotalMana(tm), tm]);
  })
  let sorted = sortArr.sort((a, b) => b[0] - a[0]);
  possibleTeams = sorted.map(s => s[1])
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
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1
      && bestCombination.backlineWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank && x[2]
            == bestCombination.bestBackline);
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner && x[1]
            == bestCombination.bestTank);
    const summoner = bestTeam[0].toString();
    return [summoner, bestTeam];
  }
  if (bestCombination.summonerWins >= 1) {
    const bestTeam = await possibleTeams.find(
        x => x[0] == bestCombination.bestSummoner);
    if (bestTeam && bestTeam.length > 0) {
      const summoner = bestTeam[0].toString();
      return [summoner, bestTeam];
    }

  }
}

function calcTotalMana(team) {
  let totalMana = 0;
  team.slice(0, 7).forEach(item => {
    if (cardsDetail.cardsDetailsIDMap[item]) {
      totalMana += parseInt(
          cardsDetail.cardsDetailsIDMap[item]['statSum1']['mana'])
    }
  })
  return totalMana;
}

function doManaStat(teams, matchDetails, tag) {
  let maxMana = 0;
  let minMana = 99;
  let manaMap = {}
  teams.forEach(ft => {
    let totalMana = calcTotalMana(ft)
    if (manaMap[totalMana]) {
      manaMap[totalMana] = manaMap[totalMana] + 1
    } else {
      manaMap[totalMana] = 1
    }
    if (totalMana >= maxMana) {
      maxMana = totalMana;
    }
    if (totalMana <= minMana) {
      minMana = totalMana;
    }
    if (maxMana > matchDetails.mana) {
      // console.log("filterOutUnplayableDragonsAnfUnplayableSplinters exception : ",maxMana , matchDetails.mana, ft)
    }
  })

  console.log(tag, maxMana, minMana, matchDetails.mana, manaMap)
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
  const filteredTeams = filteredTeamsForAvailableSplinters || teams;
  console.log("filterOutUnplayableDragonsAnfUnplayableSplinters :",
      filteredTeams.length)
  let maxMana = doManaStat(filteredTeams, matchDetails,
      "filterOutUnplayableDragonsAnfUnplayableSplinters before filter")

  if (maxMana > matchDetails.mana) {
    maxMana = matchDetails.mana
  }

  const delta = parseInt(maxMana) <= 43 ? 2 : 5;
  let resultTeams = filteredTeams.filter(ft => {
    let totalMana = calcTotalMana(ft)
    return parseInt(maxMana) - parseInt(totalMana) <= delta;
  })

  console.log("filterOutUnplayableDragonsAnfUnplayableSplinters resultTeams : ",
      resultTeams.length, delta)
  doManaStat(resultTeams, matchDetails,
      "filterOutUnplayableDragonsAnfUnplayableSplinters after filter")
  if (resultTeams.length <= 1000) {
    return filteredTeamsForAvailableSplinters || teams;
  } else {
    return resultTeams;
  }
};

//"snipe" "sneak"
function doSpecialQuest(matchDetails, quest, availableTeamsToPlay, tQuest, left,
    limitCnt) {
  let rs = availableTeamsToPlay;
  if (quest.splinter == tQuest && left > 0) {
    const filteredTeamsForQuest = availableTeamsToPlay.filter(
        team => {
          let isMatchSnipe = false;
          team.slice(1, 7).forEach(cardId => {
            const cardInfo = cardsDetail.cardsDetailsIDMap[cardId]
            if (cardInfo) {
              const abilities = cardInfo['abilities']
              let compareQuest = "snipe" == tQuest ? "Snipe" : "Sneak"
              if (abilities && abilities[0].length > 0 && abilities[0].indexOf(
                  compareQuest) != -1) {
                isMatchSnipe = true
              }
            }
          });
          return isMatchSnipe;
        });
    console.log("2-3-2-1", left + ' battles left for the  ', tQuest,
        filteredTeamsForQuest.length);
    if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
        > limitCnt) {
      console.log("2-3-2", left + ' battles left for the  ', tQuest,
          filteredTeamsForQuest.length);
      // logger.log("2-3-2", left + ' battles left for the  ', tQuest , filteredTeamsForQuest.length);
      rs = filteredTeamsForQuest;
      matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
          + rs.length
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

  console.log(
      "2-2 second step teamSelection after filger dragons ...availableTeamsToPlay len :",
      availableTeamsToPlay.length);

  // TODO
  if (availableTeamsToPlay && availableTeamsToPlay.length == 0) {

  }

  // check for enemy
  if (process.env.CONSIDER_ENEMY === 'true' && matchDetails.enemyRecent
      && matchDetails.enemyRecent.length > 0) {
    let enemyPossbileTeams = matchDetails.enemyRecent;

    console.log('enemyPossbileTeams : ', enemyPossbileTeams.length);
    matchDetails['enemyPossbileTeams'] = enemyPossbileTeams;
    matchDetails['enemySplinterTeams'] = enemyPossbileTeams;
  }

  // do prefer summoners
  if(process.env.algorithm  && process.env.algorithm == "ml") {

  } else if (matchDetails.rating && (matchDetails.rating <= 1000) ) {
    const filteredTeamsForLowRatting = availableTeamsToPlay.filter(
        team => team[0] === 259);
    if (filteredTeamsForLowRatting.length >= 2) {
      availableTeamsToPlay = filteredTeamsForLowRatting;
      console.log('do prefer summoners for low rating',
          availableTeamsToPlay.length);
    }
  }

  //CHECK FOR QUEST: TODO
  matchDetails['logContent']['QuestMatch'] = "skip"
  if (priorityToTheQuest && availableTeamsToPlay.length > 5000 && quest
      && quest.total) {
    const left = 1;
    const questCheck = matchDetails.splinters.includes(quest.splinter) && left
        > 0;

    if (questCheck) {
      const filteredTeamsForQuest = availableTeamsToPlay.filter(
          team => team[7] === quest.splinter);
      console.log("2-3-1",
          left + ' battles left for the splinter' + quest.splinter + ' quest');
      // logger.log("2-3-1", left + ' battles left for the splinter' + quest.splinter + ' quest')
      console.log("2-3-1", 'play for the quest splinter', quest.splinter, '? ',
          questCheck, " length:", filteredTeamsForQuest.length);
      // for death splinter
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 500 && quest.splinter == 'death' && matchDetails.orgMana <= 24) {
        console.log('Try to play for the quest with Teams size (V1):death',
            filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      }

      // for water splinter
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 200 && quest.splinter == 'water' && matchDetails.orgMana >= 25) {
        console.log('Try to play for the quest with Teams size (V1):water',
            filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      }

      // for fire splinter
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 1000 && quest.splinter == 'fire' && matchDetails.orgMana >= 27) {
        console.log('Try to play for the quest with Teams size (V1):fire',
            filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      }

      // for life splinter
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 2000 && quest.splinter == 'life' && (matchDetails.orgMana >= 40
              || matchDetails.orgMana <= 20)) {
        console.log('Try to play for the quest with Teams size (V1):life',
            filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      }

      // for earth splinter
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 200 && quest.splinter == 'earth' && matchDetails.orgMana >= 27) {
        console.log('Try to play for the quest with Teams size (V1):earth',
            filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      }

      console.log("dragon length : ", availableTeamsToPlay.filter(
          team => team[7] === "dragon").length)
      // for dragon splinter
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 500 && quest.splinter == 'dragon' && matchDetails.orgMana >= 28) {
        console.log('Try to play for the quest with Teams size (V1):dragon',
            filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      }

      //  no condition match teams
      if (left > 0 && filteredTeamsForQuest && filteredTeamsForQuest?.length
          > 5000
          && splinters.includes(quest.splinter)) {
        console.log('Try to play for the quest with Teams size (V1): ',
            filteredTeamsForQuest.length);
        // logger.log('Try to play for the quest with Teams size (V1): ',
        //     filteredTeamsForQuest.length);
        availableTeamsToPlay = filteredTeamsForQuest;
        matchDetails['logContent']['QuestMatch'] = quest.splinter + ":"
            + availableTeamsToPlay.length
      } else {
        console.log('CHECK FOR QUEST skip: ',
            filteredTeamsForQuest.length);
      }
    }

  }

  const res = await mostWinningSummonerTankCombo(availableTeamsToPlay,
      matchDetails);
  if (res[0] && res[1]) {
    console.log('Dont play for the quest, and play this:', res);
    res[1] = extendsHandler.doExtendsHandler(res[1], matchDetails);
    console.log(
        'Dont play for the quest, and play this doExtendsHandler realMana:',
        calcTotalMana(res[1]), ' match mana :', matchDetails.mana,
        res[1].join("-"));
    console.log('final team mana:' + calcTotalMana(res[1]), ' matchMana:',
        matchDetails.mana, res[1].join("-"));
    matchDetails['logContent']['tm'] = res[1].join("-")
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

  // if (matchDetails.enemyRecent && matchDetails.enemyRecent.length > 0) {
  //   const manaRange = getManaRange(matchDetails)
  //   let manaMatchTeams = enemy.filterManaMatch(matchDetails.enemyRecent,
  //       matchDetails.orgMana, manaRange[0], manaRange[1],
  //       matchDetails.splinters);
  //   if (manaMatchTeams && manaMatchTeams.length > 0) {
  //     let manaRuleMatchTeams = enemy.filterRuleMatch(manaMatchTeams,
  //         matchDetails.rules);
  //     if (manaRuleMatchTeams && manaRuleMatchTeams.length > 0) {
  //       enemyPossbileTeams = manaRuleMatchTeams;
  //     }
  //   }
  //
  //   matchDetails['enemyPossbileTeams'] = enemyPossbileTeams;
  //   matchDetails['enemySplinterTeams'] = matchDetails.enemyRecent;
  //   console.log('enemyPossbileTeams : ', enemyPossbileTeams.length)
  // }

  // by card cs
  let mostWinningBcTeam = []

  console.log("makeBestCombine  start ............")
  const bcTeams = await makeBestCombine(possibleTeams, matchDetails,
      bestCombination.bestSummoner);
  let bcCombine = await battles.mostWinningSummonerTank(bcTeams);
  mostWinningBcTeam = await findBestTeam(bcCombine, bcTeams)
  console.log("makeBestCombine  end ............")

  console.timeLog("battle", "2 makeBestCombine finished")

  let makeBestCombineByCsTeam = []
  const byCsTeams = await makeBestCombineByCs(possibleTeams, matchDetails,
      bestCombination.bestSummoner);
  if (byCsTeams != null) {
    let byCsCombine = await battles.mostWinningSummonerTank(byCsTeams[1]);
    makeBestCombineByCsTeam = await findBestTeam(byCsCombine, byCsTeams[1])
  }

  console.timeLog("battle", "3 makeBestCombineByCs finished")

  let makeBestCombineByCsPFSTeam = []
  const preferCsRs = preferCs.map(x => {
    return {cs: x.slice(0, x.length - 1).replaceAll("%", "-")}
  })

  const byCsTeamsPFS = matchCsTeam(preferCsRs, possibleTeams)
  console.log("pfeferCSRs : ", preferCsRs, byCsTeamsPFS.length)
  if (byCsTeamsPFS != null && byCsTeamsPFS[1] && byCsTeamsPFS[1].length > 0) {
    let byCsCombine = await battles.mostWinningSummonerTank(byCsTeamsPFS[1]);
    makeBestCombineByCsPFSTeam = await findBestTeam(byCsCombine,
        byCsTeamsPFS[1])
    console.log("4-4-55 third step PREFER_CS mts  used ............",
        new Date())
    matchDetails['logContent']['strategy'] = "mts_pfs"
  }

  let summonerTeamMap = {};
  for (var i = 0; i < matchDetails.mySummoners.length; i++) {
    var mySummoner = matchDetails.mySummoners[i];
    var filterTeams = possibleTeams.filter(x => x[0] == mySummoner);
    let bestCombination = await battles.mostWinningSummonerTank(filterTeams);
    const mostWinningSummonerTankComboTeam = await findBestTeam(bestCombination,
        filterTeams)
    if (mostWinningSummonerTankComboTeam
        && mostWinningSummonerTankComboTeam.length > 0) {
      summonerTeamMap[mySummoner] = extendsHandler.doExtendsHandler(
          mostWinningSummonerTankComboTeam[1], matchDetails);
    }

  }

  let recentEenmyTeam = []
  if (matchDetails['enemyRecent'] && matchDetails['enemyRecent'].length > 0) {
    var recentBattles = matchDetails['enemyRecent'].filter(x => {
      return x['mana_cap'] >= parseInt(matchDetails.orgMana) - 3
          && x['mana_cap'] <= parseInt(matchDetails.orgMana) + 1
    });
    let len = recentBattles.length > 10 ? 10 : recentBattles.length;
    recentEenmyTeam = recentBattles.slice(0, len).map(b => {
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
      , matchDetails);



  const againstrevertTeam = extendsHandler.doExtendsHandler(
      makeBestCombineByCsPFSTeam && makeBestCombineByCsPFSTeam.length > 1
          ? makeBestCombineByCsPFSTeam[1] : []
      , matchDetails);

  let possbiletEnemyTeam = []
  if (matchDetails['enemyPossbileTeams']
      && matchDetails['enemyPossbileTeams'].length > 0) {
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
  if (byCsTeams != null) {
    byCsTeams[0].forEach(cs => {
      enemyMostCsTeam.push(cs.split("-").map(x => getCardNameByID(x)))
    })
  }

  const mostBcTeam = extendsHandler.doExtendsHandler(
      mostWinningBcTeam
      && mostWinningBcTeam.length > 1
          ? mostWinningBcTeam[1] : []
      , matchDetails);

  const mostByCsTeam = extendsHandler.doExtendsHandler(
      makeBestCombineByCsTeam
      && makeBestCombineByCsTeam.length > 1
          ? makeBestCombineByCsTeam[1] : []
      , matchDetails);
  console.timeEnd("battle")

  const empt = matchDetails['enemyRecent']
  let enemyAgainstTeam = await doMLPredict(possibleTeams,matchDetails.mana, matchDetails.rating,matchDetails.rules,0.001,empt,matchDetails['splinters'])
  const mlTeam = extendsHandler.doExtendsHandler(
      enemyAgainstTeam[0] && enemyAgainstTeam[0].length > 1
          ? enemyAgainstTeam[0] : []
      , matchDetails);
  console.log(`doMLPredict enemyAgainstTeam: ${JSON.stringify(enemyAgainstTeam[0])}`)
  console.log(`doMLPredict enemyAgainstTeam: ${JSON.stringify(enemyAgainstTeam[1])}`)
  console.log(mostWinTeam)

  return {
    mostWinTeam: mostWinTeam,
    mostEnemyAgainstTeam: mlTeam,
    mostAgainstrevertTeam: againstrevertTeam,
    summoners: summonerTeamMap,
    recentEenmyTeam: matchDetails.enemyRecent.map(b => {
      return [getCardNameByID(b['summoner_id']),
        getCardNameByID(b['monster_1_id']), getCardNameByID(b['monster_2_id'])
        , getCardNameByID(b['monster_3_id']),
        getCardNameByID(b['monster_4_id']), getCardNameByID(b['monster_5_id']),
        getCardNameByID(b['monster_6_id']), '', b['mana_cap'], b['isWin'],
        b['ruleset']]
    }),
    mostBcTeam: mostBcTeam,
    mostByCsTeam: mostByCsTeam,
    score : enemyAgainstTeam[1] ? enemyAgainstTeam[1] : 0
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

function getManaRange(matchDetails) {
  let delta = 0;
  if (matchDetails.mana <= 17) {
    delta = 0
  }
  if (matchDetails.mana >= 18 && matchDetails.mana <= 28) {
    delta = 1
  }
  if (matchDetails.mana >= 29 && matchDetails.mana <= 35) {
    delta = 2
  }
  if (matchDetails.mana >= 36 && matchDetails.mana <= 44) {
    delta = 3
  }

  let fromMana = matchDetails.mana >= 45 ? 45 : parseInt(matchDetails.mana)
      - parseInt(delta);
  let endMana = parseInt(matchDetails.mana) + parseInt(delta);
  return [fromMana, endMana]
}

//能够打败enemy 最近5组主要Summoner的cs组合
async function initCSTeams(possibleTeams, matchDetails,
    matchSplintersSummoners) {
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];

  if (matchSplintersSummoners && matchSplintersSummoners.length == 0) {
    return [];
  }
  console.log("makeBestCombine select  : ", matchSplintersSummoners)
  // logger.log("makeBestCombine select  : " , matchSplintersSummoners)
  const myAviableSummoners = getSummoners(matchDetails.myCards,
      matchDetails.splinters)
  let sql = "select cs , sum(teams)/sum(teams+lostTeams) as tl   from   battle_stat_v1 where ( ";
  let csLike = "";
  for (var i = 0; i < myAviableSummoners.length; i++) {
    if (i != 0) {
      csLike += " or "
    }
    csLike += "cs like '" + myAviableSummoners[i] + "%'";
  }
  csLike += " ) and "
  sql += csLike;
  sql += " summonerId in ( " + matchSplintersSummoners.join(",") + ") and "
  let mustRules = battles.getMustRules(matchDetails.rules);
  if (mustRules == "ALL") {
    let keyRules = mustRules.split('|');
    let reserveRule = keyRules[1] + "|" + keyRules[0]
    sql += "( rule = '" + mustRules + "' or rule = '" + reserveRule
        + "' )  and "
  } else if (mustRules == "" || mustRules == "ANY") {
    sql += " rule = 'default'  and "
  } else {
    sql += " rule = '" + mustRules + "'  and "
  }
  sql += "  startMana >=" + fromMana + " and startMana <= " + endMana
      + "   GROUP BY cs  HAVING    tl >0.55   and sum(totalcnt - lostTotalCnt) >5  order by len asc ,  sum(teams -lostTeams ) desc , tl desc "
  const data = await dbUtils.sqlQuery(sql);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('makeBestCombine', rs.length, sql);
  return rs;
}

async function initPerferCSTeams(possibleTeams, matchDetails,
    matchSplintersSummoners) {
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];

  if (matchSplintersSummoners && matchSplintersSummoners.length == 0) {
    return [];
  }
  console.log("initPerferCSTeams select  : ", matchSplintersSummoners)
  // logger.log("initPerferCSTeams select  : " , matchSplintersSummoners)
  const myAviableSummoners = getSummoners(matchDetails.myCards,
      matchDetails.splinters)
  let sql = "select cs , sum(teams)/sum(teams+lostTeams) as tl   from   ByEnemyCs where ( ";
  let csLike = "";
  for (var i = 0; i < myAviableSummoners.length; i++) {
    if (i != 0) {
      csLike += " or "
    }
    csLike += "cs like '" + myAviableSummoners[i] + "%'";
  }
  csLike += " ) and  ("
  sql += csLike;
  const preferLike = preferCs.map(cs => {
    return "cs like '" + cs + "' "
  }).join(" or ")
  sql += preferLike
  sql += ") and summonerId in ( " + matchSplintersSummoners.join(",") + ") and "
  let mustRules = battles.getMustRules(matchDetails.rules);
  if (mustRules == "ALL") {
    let keyRules = mustRules.split('|');
    let reserveRule = keyRules[1] + "|" + keyRules[0]
    sql += "( rule = '" + mustRules + "' or rule = '" + reserveRule
        + "' )  and "
  } else if (mustRules == "" || mustRules == "ANY") {
    sql += " rule = 'default'  and "
  } else {
    sql += " rule = '" + mustRules + "'  and "
  }
  sql += "  startMana >=" + fromMana + " and startMana <= " + endMana
      + "   GROUP BY cs  order by len asc ,  sum(teams -lostTeams ) desc , tl desc "
  const data = await dbUtils.sqlQuery(sql);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('initPerferCSTeams', rs.length, sql);
  return rs;
}

async function makeBestCombine(possibleTeams, matchDetails,
    mostSummoner = null) {
  let matchSplintersSummoners = battles.matchedEnemyPossbileSummoners(
      matchDetails['enemyPossbileTeams'], true);

  let rs = await initCSTeams(possibleTeams, matchDetails,
      matchSplintersSummoners)
  let matchCS = matchCsTeam(rs, possibleTeams)
  console.log('2 makeBestCombine initCSTeams do enemy full rule match : ',
      matchCS[1].length);
  let isMatchPrefer = false;

  if (matchCS[1].length <= 0 && matchDetails['enemyPossbileTeams']
      && matchDetails['enemySplinterTeams']
      && matchDetails['enemyPossbileTeams'].length
      < matchDetails['enemySplinterTeams'].length) { //TODO
    matchSplintersSummoners = battles.matchedEnemyPossbileSummoners(
        matchDetails['enemySplinterTeams'], false);
    if (mostSummoner) {
      matchSplintersSummoners.push(mostSummoner)
    }

    rs = await initCSTeams(possibleTeams, matchDetails, matchSplintersSummoners)
    matchCS = matchCsTeam(rs, possibleTeams)
    console.log('4 makeBestCombine do enemy splinters match : ',
        matchCS[1].length);
    isMatchPrefer = false;
  }

  let cs = matchCS[0]
  let matchTeams = matchCS[1]
  if (matchCS && cs.length > 0 && matchTeams.length > 0) {
    console.log("----", JSON.stringify(matchTeams.length))
    let next = true;
    while (next) {
      let extendsResult = await extendsCombineSearch(cs, matchTeams,
          matchDetails, matchSplintersSummoners)
      if (extendsResult[1] && extendsResult[1].length > 0) {
        cs = extendsResult[0];
        matchTeams = extendsResult[1]
      } else {
        next = false;
      }
    }
  }
  console.log("--makeBestCombine--final--", cs,
      JSON.stringify(matchTeams.length))
  if (matchTeams != null && matchTeams.length > 0) {
    matchDetails['logContent']['strategy'] = "ByEnemySM"
    matchDetails['logContent']['isMatchPrefer'] = isMatchPrefer
    matchDetails['logContent']['stgLen'] = matchTeams.length
  }
  return matchTeams;
}

function splitCS(lead, t, a) {
  if (t.length >= 2) {
    let bs = lead + "-" + t[0]
    for (let i = 1; i <= t.length - 1; i++) {
      let s = bs + "-" + t[i]
      a.push(s)
    }
  }
  if (t.length >= 3) {
    let bs2 = lead + "-" + t[0] + "-" + t[1]
    for (let i = 2; i <= t.length - 1; i++) {
      let s = bs2 + "-" + t[i]
      a.push(s)
    }
  }
  if (t.length >= 4) {
    let bs3 = lead + "-" + t[0] + "-" + t[1] + "-" + t[2]
    for (let i = 3; i <= t.length - 1; i++) {
      let s = bs3 + "-" + t[i]
      a.push(s)
    }
  }
  if (t.length >= 3) {
    splitCS(lead, t.slice(1, t.length), a)
  }
}

async function selectCsLs(sql, params) {
  const data = await dbUtils.sqlQuery(sql, params);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('makeBestCombineV2', rs.length, sql, params);
  return rs;
}

function sortByPreferCsOrder(rs) {
  if (process.env.PREFER_CS == "false") {
    return rs;
  }
  let sortRs = []
  const collectList = []
  delete require.cache[require.resolve("./data/strategy/preferCs")]
  const preferCs2 = require('./data/strategy/preferCs')
  preferCs2.forEach(cs => {
    const cardIds = cs.split("%")
    rs.forEach(item => {
      const itemIds = item['cs'].split("-")
      const interceptIds = cardIds.filter(function (v) {
        return itemIds.indexOf(v) > -1
      })
      if (interceptIds.length == cardIds.length - 1) {
        if (collectList.indexOf(item['cs']) == -1) {
          sortRs.push(item)
          collectList.push(item['cs'])
        }
      }
    })
  })
  sortRs = sortRs.concat(rs.filter(x => {
    return sortRs.find(sr => sr['cs'] == x['cs']) == null
  }))
  if (sortRs.length >= 3) {
    console.log("sortByPreferCsOrder:", rs.length, sortRs.length,
        sortRs.slice(0, 3))
  }
  return sortRs;
}

const skipIds = [-1, 131, 91, 169, 366, 380, 394, 408, 422, 77, 91, 95, 119,
  136, 169, 227, 230, 238, 277, 290, 296, 297, 298, 313, 353, 367, 381, 395,
  409, 426]

// 根据enemy 组合
async function makeBestCombineByCs(possibleTeams, matchDetails, limitCnt = 3) {
  let teamCs = []
  let filterStart = 0;
  let filterEnd = 99;
  if (matchDetails.mana <= 24) {
    filterEnd = 24;
  } else if (matchDetails.mana <= 38) {
    filterStart = 24;
    filterEnd = 38;
  } else {
    filterStart = 38;
    filterEnd = 99;
  }

  let maxEnemyMana = 0;
  let minEnemyMana = 99;
  if (matchDetails['enemyPossbileTeams'] == null
      || matchDetails['enemyPossbileTeams'].length == 0) {
    return null;
  }
  let ept = matchDetails['enemyPossbileTeams'].filter(t => {
    if (t['mana_cap'] > maxEnemyMana) {
      maxEnemyMana = t['mana_cap'];
    }

    if (t['mana_cap'] < minEnemyMana) {
      minEnemyMana = t['mana_cap'];
    }

    return t['mana_cap'] >= filterStart && t['mana_cap'] <= filterEnd
  })

  console.log("maxEnemyMana:", maxEnemyMana, "minEnemyMana:", minEnemyMana)
  if (ept.length == 0) {
    ept = matchDetails['enemyPossbileTeams'].filter(t => {
      return t['mana_cap'] >= filterStart - 10 && t['mana_cap'] <= filterEnd
          + 10
    })
  }
  console.log("makeBestCombineByCs ept:", matchDetails.mana, ept)
  // console.log("ept:",ept)
  if (ept == null || ept.length == 0) {
    return null;
  }
  ept.forEach(t => {
    const leader = t['summoner_id'];
    const teams = [t['monster_1_id'], t['monster_2_id'], t['monster_3_id'],
      t['monster_4_id'], t['monster_5_id'], t['monster_6_id']].filter(
        x => x != "" && skipIds.indexOf(parseInt(x)) == -1)

    teams.sort((a, b) => a - b)
    splitCS(leader, teams, teamCs)
  })
  // console.log("teamCs:",teamCs)
  let maxLen = 0;
  let c = teamCs.reduce((pre, value) => {
    if (value.split("-").length > maxLen) {
      maxLen = value.split("-").length;
    }
    if (value in pre) {
      pre[value]++;
    } else {
      pre[value] = 1;
    }
    return pre;
  }, {})
  let sorted = Object.entries(c).filter(
      x => x[0].split("-").length >= maxLen - 1).sort((a, b) => {
    return b[1] - a[1]
  }).map(x => x[0])

  const sIdMap = {}
  const selectSortedCS = []
  let topSummoners = battles.matchedEnemyPossbileSummoners(
      matchDetails['enemyPossbileTeams'], true);
  if (topSummoners && topSummoners.length > 0) {
    topSummoners.forEach(sId => {
      sorted.forEach(cs => {
        if (sIdMap[sId] == null) {
          sIdMap[sId] = 0
        }
        if (cs.startsWith(sId.toString())) {
          if (sIdMap[sId] <= 5) {
            selectSortedCS.push(cs)
            sIdMap[sId] += 1
          }
        }
      })
    })
  }

  const len = selectSortedCS.length >= 10 ? 10 : selectSortedCS.length
  const topCs = selectSortedCS.slice(0, len).sort((a, b) => b.length - a.length)
  console.log("makeBestCombineByCs top enemy cs :", topSummoners, topCs)
  if (topCs && topCs.length == 0) {
    return null
  }

  const matchSplintersSummoners = {}
  topCs.forEach(x => matchSplintersSummoners[x.split("-")[0]] = true)
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];

  let mustRules = battles.getMustRules(matchDetails.rules);
  let matchRule = matchDetails.rules;
  if (mustRules == "ALL") {
    let keyRules = mustRules.split('|');
    matchRule = keyRules.sort((a1, a2) => a1.localeCompare(a2)).join("|")
  } else if (mustRules == "" || mustRules == "ANY") {
    matchRule = 'default'
  } else {
    matchRule = mustRules
  }
  const params = [fromMana, endMana, matchRule];

  const topCsLikeSql = topCs.map(cs => {
    return " lcs like '" + cs.replaceAll("-", "%") + "%' "
  }).join(" or ")

  console.log("topCsLikeSql:", topCsLikeSql)

  let sql = " select  wcs as cs ,count(*) as cnt  from battle_stat_cs_ls_v1 where startMana >= ? and startMana <= ? and rule = ? and ("
      + topCsLikeSql + ") and count >=" + limitCnt
      + "  group by wcs order by   cnt desc , count asc    limit 5000";
  let rs = await selectCsLs(sql, params)
  let matchCS = matchCsTeam(rs, possibleTeams)
  let isMatchPrefer = false;

  let cs = matchCS[0]
  let matchTeams = matchCS[1]
  if (matchCS && cs.length > 0 && matchTeams.length > 0) {
    console.log("----", JSON.stringify(matchTeams.length))
    let next = true;
    while (next) {
      let extendsResult = await extendsCombineSearch(cs, matchTeams,
          matchDetails, Object.keys(matchSplintersSummoners))
      if (extendsResult[1] && extendsResult[1].length > 0) {
        cs = extendsResult[0];
        matchTeams = extendsResult[1]
      } else {
        next = false;
      }
    }
  }
  console.log("--makeBestCombineByCs--final--", cs,
      JSON.stringify(matchTeams.length))
  if (matchTeams != null && matchTeams.length > 0) {
    matchDetails['logContent']['strategy'] = "ByEnemyCs"
    matchDetails['logContent']['isMatchPrefer'] = isMatchPrefer
    matchDetails['logContent']['stgLen'] = matchTeams.length
  }
  return [topCs, matchTeams];
}

function matchCsTeam(rs, possibleTeams) {
  rs = sortByPreferCsOrder(rs)
  let matchTeams = [];
  let matchCs = "";
  if (rs && rs.length > 0) {
    for (var i = 0; i < rs.length; i++) {
      const cs = rs[i]['cs']
      const teamCS = cs.split("-")
      matchTeams = possibleTeams.filter(pt => { // must
        let isMatch = true;
        teamCS.slice(1, teamCS.length).forEach(csCard => {
          if (pt.indexOf(parseInt(csCard)) == -1) {
            isMatch = false;
          }
        })
        return pt[0] == teamCS[0] && isMatch
      })
      if (matchTeams && matchTeams.length > 0) {
        matchCs = cs;
        console.log(i, cs, rs[i]['tl'] ? rs[i]['tl'] : rs[i]['cnt'])
        console.log("matchTeams .......", matchTeams.length)
        break;
      }
    }
  }
  return [matchCs, matchTeams];
}

async function extendsCombineSearch(cs, matchTeams, matchDetails,
    matchSplintersSummoners) {
  const manaRange = getManaRange(matchDetails);
  let fromMana = manaRange[0];
  let endMana = manaRange[1];
  let sql = "select cs , sum(teams)/sum(teams+lostTeams) as tl   from   battle_stat_v1 where  ";
  let csLike = "cs like '";
  let spCs = cs.split("-")
  spCs.slice(2, spCs.length).forEach(itemCs => {
    cs = cs.replace(itemCs, "%" + itemCs + "%")
  })
  csLike += cs
  csLike += "'  and "
  sql += csLike;
  sql += " summonerId in ( " + matchSplintersSummoners.join(",") + ") and "
  let mustRules = battles.getMustRules(matchDetails.rules);
  if (mustRules == "ALL") {
    let keyRules = mustRules.split('|');
    let matchRules = keyRules.sort((a1, a2) => a1.localeCompare(a2)).join("|")
    sql += " rule = '" + matchRules + "' )  and "
  } else if (mustRules == "" || mustRules == "ANY") {
    sql += " rule = 'default'  and "
  } else {
    sql += " rule = '" + mustRules + "'  and "
  }
  sql += "len > " + (spCs.length - 1) + " and startMana >=" + fromMana
      + " and startMana <= " + endMana
      + "   GROUP BY cs   order by   tl desc  ,sum(teams -lostTeams ) desc "
  const data = await dbUtils.sqlQuery(sql);
  const string = JSON.stringify(data);
  const rs = JSON.parse(string);
  console.log('extendsCombineSearch', rs, sql);
  return matchCsTeam(rs, matchTeams)
}

//[["278", "380" ,"180" ,"188" ,"-1" ,"-1" ,"-1" ,19 ,"Fog of War|Noxious Fumes", 1500]]
async function doMLPredict(possibleTeams,mana, rating,rules,score,enemyPossbileTeams,splinters) {
  const splinter= [ 'fire', 'water', 'earth', 'life', 'death', 'dragon' ]
  let active = [0,0,0,0,0,0]
  splinters.map(x => {
    active[splinter.indexOf(x)]=1
  })
  let requestData = possibleTeams.map(x =>[x[0].toString(),x[1].toString(),x[2].toString(),x[3].toString(),x[4].toString(),x[5].toString(),x[6].toString(),parseInt(mana),rules,rating,active.join(",")])
  const data = JSON.stringify(requestData)
  const splintersSummoners =getSplintersSummoners(splinters)
  let ept = enemyPossbileTeams.filter(x => splintersSummoners.indexOf(x['summoner_id']) != -1)
  let topSummoners = battles.matchedEnemyPossbileSummoners(
      ept, true);
  const tems = topSummoners
  // console.log(data)
  const result = await new Promise((resolve, reject) => {
    request({
      url: 'http://192.168.99.100:28888',
      method: "POST",
      // json: true,
      headers: {
        "content-type": "application/json",
        "account":process.env.ACCOUNT,
        "ems":tems
      },
      body: data
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(' error - -');
      }
    });

  }).then(result => {
    console.log("outside request: " + result);
    return result;
  }).catch(err => {
    console.log("error: " + err)
    return null
  })
  if(result == null ){
    return []
  }

  const index = JSON.parse(result).filter(x =>parseFloat(x.rate) >= score).map(x =>x.index)[0]
  const rate = JSON.parse(result)[0].rate
  return [possibleTeams[index],rate]
}

module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;
module.exports.getSummoners = getSummoners;
module.exports.getSplintersSummoners = getSplintersSummoners;
module.exports.teamSelectionForWeb = teamSelectionForWeb
module.exports.logger = logger;
module.exports.summoners = summoners;
module.exports.doFocusFilter = doFocusFilter;
module.exports.cardsIdsforSelectedBattles = cardsIdsforSelectedBattles;
module.exports.askFormation = askFormation;

// selectBattleDate(23,"Standard",