const ask = require('./possibleTeams');
const dbUtils = require('./db/script/dbUtils');
// 位置策略
const mostWinningSummonerTank = (possibleTeamsList) => {
    mostWinningDeck = { fire: 0, death: 0, earth: 0, water: 0, life: 0 }
    const mostWinningSummoner = {};
    const mostWinningTank = {};
    const mostWinningBackline = {};
    const mostWinningSecondBackline = {};
    const mostWinningThirdBackline = {};
    const mostWinningForthBackline = {};
    console.log("mostWinningSummonerTank  possibleTeamsList:" + possibleTeamsList.length)

    possibleTeamsList.forEach(x => {
        const summoner = x[0];
        mostWinningSummoner[summoner] = mostWinningSummoner[summoner] ? mostWinningSummoner[summoner] + 1 : 1;

    })
    const bestSummoner = Object.keys(mostWinningSummoner).length && Object.keys(mostWinningSummoner).reduce((a, b) => mostWinningSummoner[a] > mostWinningSummoner[b] ? a : b);
    console.log('BESTSUMMONER: ', bestSummoner)
    ask.logger.log('BESTSUMMONER: ', bestSummoner)
    if (bestSummoner) {
        possibleTeamsList.filter(team => team[0] == bestSummoner).forEach(team => {
            const tank = team[1];
            mostWinningTank[tank] = mostWinningTank[tank] ? mostWinningTank[tank] + 1 : 1;
        })
        const bestTank = mostWinningTank && Object.keys(mostWinningTank).length && Object.keys(mostWinningTank).reduce((a, b) => mostWinningTank[a] > mostWinningTank[b] ? a : b);

        if (bestTank) {
            possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank).forEach(team => {
                const backline = team[2];
                mostWinningBackline[backline] = mostWinningBackline[backline] ? mostWinningBackline[backline] + 1 : 1;
            })
            const bestBackline = mostWinningBackline && Object.keys(mostWinningBackline).length && Object.keys(mostWinningBackline).reduce((a, b) => mostWinningBackline[a] > mostWinningBackline[b] ? a : b);

            if (bestBackline) {
                possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank && team[2] == bestBackline).forEach(team => {
                    const secondBackline = team[3];
                    mostWinningSecondBackline[secondBackline] = mostWinningSecondBackline[secondBackline] ? mostWinningSecondBackline[secondBackline] + 1 : 1;
                })
                const bestSecondBackline = mostWinningSecondBackline && Object.keys(mostWinningSecondBackline).length && Object.keys(mostWinningSecondBackline).reduce((a, b) => mostWinningSecondBackline[a] > mostWinningSecondBackline[b] ? a : b);

                if (bestSecondBackline) {
                    possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank && team[2] == bestBackline && team[3] == bestSecondBackline).forEach(team => {
                        const thirdBackline = team[4];
                        mostWinningThirdBackline[thirdBackline] = mostWinningThirdBackline[thirdBackline] ? mostWinningThirdBackline[thirdBackline] + 1 : 1;
                    })
                    const bestThirdBackline = mostWinningThirdBackline && Object.keys(mostWinningThirdBackline).length && Object.keys(mostWinningThirdBackline).reduce((a, b) => mostWinningThirdBackline[a] > mostWinningThirdBackline[b] ? a : b);

                    if (bestThirdBackline) {
                        possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank && team[2] == bestBackline && team[3] == bestSecondBackline && team[4] == bestThirdBackline).forEach(team => {
                            const forthBackline = team[5];
                            mostWinningForthBackline[forthBackline] = mostWinningForthBackline[forthBackline] ? mostWinningForthBackline[forthBackline] + 1 : 1;
                        })
                        const bestForthBackline = mostWinningForthBackline && Object.keys(mostWinningForthBackline).length && Object.keys(mostWinningForthBackline).reduce((a, b) => mostWinningForthBackline[a] > mostWinningForthBackline[b] ? a : b);

                        return {
                            bestSummoner: bestSummoner,
                            summonerWins: mostWinningSummoner[bestSummoner],
                            tankWins: mostWinningTank[bestTank],
                            bestTank: bestTank,
                            bestBackline: bestBackline,
                            backlineWins: mostWinningBackline[bestBackline],
                            bestSecondBackline: bestSecondBackline,
                            secondBacklineWins: mostWinningSecondBackline[bestSecondBackline],
                            bestThirdBackline: bestThirdBackline,
                            thirdBacklineWins: mostWinningThirdBackline[bestThirdBackline],
                            bestForthBackline: bestForthBackline,
                            forthBacklineWins: mostWinningForthBackline[bestForthBackline]
                        }
                    }

                    return {
                        bestSummoner: bestSummoner,
                        summonerWins: mostWinningSummoner[bestSummoner],
                        tankWins: mostWinningTank[bestTank],
                        bestTank: bestTank,
                        bestBackline: bestBackline,
                        backlineWins: mostWinningBackline[bestBackline],
                        bestSecondBackline: bestSecondBackline,
                        secondBacklineWins: mostWinningSecondBackline[bestSecondBackline],
                        bestThirdBackline: bestThirdBackline,
                        thirdBacklineWins: mostWinningThirdBackline[bestThirdBackline]
                    }
                }

                return {
                    bestSummoner: bestSummoner,
                    summonerWins: mostWinningSummoner[bestSummoner],
                    tankWins: mostWinningTank[bestTank],
                    bestTank: bestTank,
                    bestBackline: bestBackline,
                    backlineWins: mostWinningBackline[bestBackline],
                    bestSecondBackline: bestSecondBackline,
                    secondBacklineWins: mostWinningSecondBackline[bestSecondBackline]
                }
            }

            return {
                bestSummoner: bestSummoner,
                summonerWins: mostWinningSummoner[bestSummoner],
                tankWins: mostWinningTank[bestTank],
                bestTank: bestTank,
                bestBackline: bestBackline,
                backlineWins: mostWinningBackline[bestBackline]
            }
        }

        return {
            bestSummoner: bestSummoner,
            summonerWins: mostWinningSummoner[bestSummoner],
            tankWins: mostWinningTank[bestTank],
            bestTank: bestTank
        }
    }
    return {
        bestSummoner: bestSummoner,
        summonerWins: mostWinningSummoner[bestSummoner]
    }
}

//
function getMustRules(ruleset){
    let keyRules = ruleset.split('|');
    let mustRule = "";
    if(keyRules.length > 1){
        if(process.env.KEY_SINGLE_RULES.indexOf(keyRules[0]) != -1 &&
            process.env.KEY_SINGLE_RULES.indexOf(keyRules[1]) == -1) {
            mustRule = keyRules[0];
        }

        if(process.env.KEY_SINGLE_RULES.indexOf(keyRules[0]) == -1 &&
            process.env.KEY_SINGLE_RULES.indexOf(keyRules[1]) != -1) {
            mustRule = keyRules[1];
        }

        if(process.env.KEY_SINGLE_RULES.indexOf(keyRules[0]) != -1 &&
            process.env.KEY_SINGLE_RULES.indexOf(keyRules[1]) != -1) {
            mustRule = "ALL";
        }
    }
    return mustRule;
}

function getRuleMatch(hisBattleRuleset, matchRuleset,mustRule) {
    console.log("hisBattleRuleset : ", hisBattleRuleset , "matchRuleset :" , matchRuleset , "mustRule :", mustRule)
    if(mustRule != "" && mustRule != "ALL"){
        return hisBattleRuleset.indexOf(mustRule) != -1;
    }

    if(mustRule == "ALL"){
        let keyRules = matchRuleset.split('|');
        let reserveRule = keyRules[1]+"|" +  keyRules[0]
        return  hisBattleRuleset == matchRuleset || hisBattleRuleset == reserveRule;
    }

    return false;
}

async function  mostWinningEnemy(possibleTeamsList , enemyPossbileTeams ,ruleset ){
    let matchTeams = [];
    if(enemyPossbileTeams && enemyPossbileTeams.length > 0){
        let winTeams = enemyPossbileTeams.filter(bt => {
            let mustRule = getMustRules(ruleset);
            let ruleMatch = getRuleMatch(bt['ruleset'],ruleset,mustRule);
            return bt['isWin'] == true && ruleMatch
        }  )
        if(winTeams && winTeams.length >0) {
            const ept = winTeams[0];
            console.log("mostWinningEnemy win :",JSON.stringify(ept))
            return findAgainstTeam(ept,possibleTeamsList)
        }

        if(matchTeams.length == 0){
            const mostSummoner = enemyPossbileTeams.reduce((acc, value) => {
                // Group initialization
                if (!acc[value['summoner_id']]) {
                    acc[value['summoner_id']] = 1;
                }
                // Grouping
                acc[value['summoner_id']] = acc[value['summoner_id']] + 1;
                return acc;
            }, {});
            let entries = Object.entries(mostSummoner);
            let sorted = entries.sort((a, b) => b[1] - a[1]);
            console.log("-------sorted[0][0]---",sorted[0][0])
            var mostSummonerTeams = enemyPossbileTeams.filter(ep => ep['summoner_id'] == sorted[0][0] );
            if(mostSummonerTeams && mostSummonerTeams.length > 0){
                const team = await findAgainstTeam(mostSummonerTeams[0],possibleTeamsList);
                return [sorted[0][0],team];
            }
        }
    }
}

async function  mostWinningByEnemySummoner(possibleTeamsList ,  summoner, matchDetails){
    let sql = "select battle_queue_id from battle_history_raw_v2 where mana_cap = ?  and summoner_id_lost = ?  and ruleset = ?"
    const params = [matchDetails.orgMana, summoner, matchDetails.rules];
    // console.log("find target against mostWinningByEnemySummoner :", JSON.stringify(params))
    const rs = await dbUtils.sqlQuery(sql,params);
    console.log("find target against mostWinningByEnemySummoner team",rs.length )
    if( rs.length > 0 ){
        let queue_ids = rs.map(x =>x['battle_queue_id'])
        const matchTeams = possibleTeamsList.filter(x => queue_ids.indexOf(x[10]) !=-1 )
        console.log("find  mostWinningByEnemySummoner match team" ,JSON.stringify(matchTeams))
        return matchTeams
    } else {
        console.log("no  mostWinningByEnemySummoner match team ..." )
    }
}

async function findAgainstTeam(ept,possibleTeamsList){
    let sql = "select battle_queue_id from battle_history_raw_v2 where   summoner_id_lost = ? and  monster_1_id_lost = ? and  monster_2_id_lost = ?  and  monster_3_id_lost = ? and  monster_4_id_lost = ?  and  monster_5_id_lost = ?  and  monster_6_id_lost = ? "
    dbUtils.washdata(ept,['summoner_id','monster_1_id',  'monster_2_id',
        'monster_3_id', 'monster_4_id',
        'monster_5_id', 'monster_6_id'])
    const params = [ ept.summoner_id,ept.monster_1_id
        ,ept.monster_2_id,ept.monster_3_id,ept.monster_4_id,ept.monster_5_id,ept.monster_6_id];
    console.log("find target against :",params)
    const rs = await dbUtils.sqlQuery(sql,params);
    console.log("find team",rs.length)
    if( rs.length > 0 ){
        let queue_ids = rs.map(x =>x['battle_queue_id'])
        const matchTeams = possibleTeamsList.filter(x => queue_ids.indexOf(x[10]) !=-1 )
        console.log("find match team" , matchTeams.length)
        return matchTeams
    } else {
        console.log("no match team ..." )
    }
}

module.exports.mostWinningSummonerTank = mostWinningSummonerTank;
module.exports.mostWinningEnemy = mostWinningEnemy;
module.exports.findAgainstTeam = findAgainstTeam;
module.exports.mostWinningByEnemySummoner=mostWinningByEnemySummoner
module.exports.getMustRules = getMustRules;
module.exports.getRuleMatch = getRuleMatch;

let test = [{
    'summoner_id': 440,
    'summoner_level': 1,
    'monster_1_id': 162,
    'monster_1_level': 1,
    'monster_1_abilities': ['Shield'],
    'monster_2_id': 426,
    'monster_2_level': 1,
    'monster_2_abilities': [],
    'monster_3_id': 395,
    'monster_3_level': 1,
    'monster_3_abilities': [],
    'monster_4_id': 158,
    'monster_4_level': 1,
    'monster_4_abilities': ['Opportunity'],
    'monster_5_id': 402,
    'monster_5_level': 1,
    'monster_5_abilities': [],
    'monster_6_id': 401,
    'monster_6_level': 1,
    'monster_6_abilities': ['Sneak'],
    'created_date': '2021-12-23T06:52:23.702Z',
    'match_type': 'Ranked',
    'mana_cap': 26,
    'ruleset': 'Standard',
    'inactive': '',
    'isWin': false
}, {
    'summoner_id': 167,
    'summoner_level': 1,
    'monster_1_id': 160,
    'monster_1_level': 1,
    'monster_1_abilities': [],
    'monster_2_id': '',
    'monster_2_level': '',
    'monster_2_abilities': '',
    'monster_3_id': '',
    'monster_3_level': '',
    'monster_3_abilities': '',
    'monster_4_id': '',
    'monster_4_level': '',
    'monster_4_abilities': '',
    'monster_5_id': '',
    'monster_5_level': '',
    'monster_5_abilities': '',
    'monster_6_id': '',
    'monster_6_level': '',
    'monster_6_abilities': '',
    'created_date': '2021-12-23T06:51:12.801Z',
    'match_type': 'Ranked',
    'mana_cap': 20,
    'ruleset': 'Keep Your Distance',
    'inactive': 'Green,Black',
    'isWin': false
}, {
    'summoner_id': 440,
    'summoner_level': 1,
    'monster_1_id': 165,
    'monster_1_level': 1,
    'monster_1_abilities': [],
    'monster_2_id': '',
    'monster_2_level': '',
    'monster_2_abilities': '',
    'monster_3_id': '',
    'monster_3_level': '',
    'monster_3_abilities': '',
    'monster_4_id': '',
    'monster_4_level': '',
    'monster_4_abilities': '',
    'monster_5_id': '',
    'monster_5_level': '',
    'monster_5_abilities': '',
    'monster_6_id': '',
    'monster_6_level': '',
    'monster_6_abilities': '',
    'created_date': '2021-12-23T06:51:12.801Z',
    'match_type': 'Ranked',
    'mana_cap': 20,
    'ruleset': 'Keep Your Distance',
    'inactive': 'Green,Black',
    'isWin': false
}];

let possibleTeamsList =[{battle_queue_id: "38b5c8318b14b65f1697203c107f4af07acb0a7f"},{battle_queue_id: "sl_00aa40968e00b2f2d272689b685bd80d"}]



// mostWinningEnemy(possibleTeamsList,test).then(x =>{
//     console.log(JSON.stringify(x))
// })

