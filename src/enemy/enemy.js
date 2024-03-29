const cardsDetails = require('../../data/cardsDetails');
const battles = require('../../battles');
const pt = require('../../possibleTeams')

/**
 * isWin: created_date : match_type : mana_cap :ruleset ：s,m1
 */

function filterManaMatch(input, mana , fromMana ,endMana , splinters) {
  // mana = mana >= 48 ? 48 : mana;
  const splintersSummoners =pt.getSplintersSummoners(splinters)
  console.log("splintersSummoners:",JSON.stringify(splintersSummoners))
  let matchTeams = input.filter(x => {
    let totalMana = parseInt(x['mana_cap']) //
    return  totalMana >= fromMana && totalMana <= endMana && splintersSummoners.indexOf(x['summoner_id']) != -1 ;
  });
  console.log('filterManaMatch target:', mana, 'matchTeams size : ' + matchTeams.length);
  return matchTeams;
}

function filterRuleMatch(input, ruleset) {
  let matchList = [];
  let orgInputList = [];
  input.forEach(item => {
    const mustRules = battles.getMustRules(ruleset);
    const ruleMatch = battles.getRuleMatch(item['ruleset'],ruleset , mustRules);
    if(ruleMatch) {
       matchList.push(item)
    }
    orgInputList.push(item)
  });
  if(matchList.length == 0 ){
    matchList = orgInputList;
  }
  return matchList;
}

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
}];
// console.log(test.length);
// var rs = filterManaMatch(test, '20');
// filterRuleMatch(rs,"Keep Your Distance").forEach(x =>console.log(JSON.stringify(x)))

module.exports.filterManaMatch = filterManaMatch;
module.exports.filterRuleMatch = filterRuleMatch;
