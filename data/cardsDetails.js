const cardsDetails = require("./cardsDetails.json");
const defaultRules = require("./strategy/defaultRule.json");

const cardsDetailsNameMap = {}
const cardsDetailsIDMap = {}


cardsDetails.map(cd => {
  const name = cd['name'];
  const stat = cd['stats']
  const type = cd['type'] // Monster ,Summoner
  const statSum1 =
      type == 'Monster' ?
          {
            'mana': stat["mana"][0], 'attack': stat["attack"][0]
            , 'attack': stat["attack"][0]
            , 'ranged': stat["ranged"][0]
            , 'magic': stat["magic"][0]
            , 'armor': stat["armor"][0]
            , 'health': stat["health"][0]
            , 'speed': stat["speed"][0]
          } : {
            'mana': stat["mana"], 'attack': stat["attack"]
            , 'attack': stat["attack"]
            , 'ranged': stat["ranged"]
            , 'magic': stat["magic"]
            , 'armor': stat["armor"]
            , 'health': stat["health"]
            , 'speed': stat["speed"]
          };

  const abilities = cd['abilities'] //
  const cardDetailId = cd['distribution'][0]['card_detail_id']
  const item = {
    'statSum1': statSum1,
    'type': type,
    'abilities': abilities,
    'cardDetailId': cardDetailId,
    'name': name
  };
  cardsDetailsNameMap[name] = item;
  cardsDetailsIDMap[cardDetailId] = item;
})


function getEnemyBufferRecentInfo(input,targetType) {
  let reduceDetail = {};
  input.forEach((x) => {
    let name = x[0];
    let detail = cardsDetailsNameMap[name];
    if (detail && detail['type'] == targetType) {
      let statSum1 = detail['statSum1'];
      // if (!reduceDetail['mana']) {
      //   reduceDetail['mana'] = statSum1['mana'];
      // }
      // reduceDetail['mana'] = reduceDetail['mana'] + statSum1['mana'];

      if (!reduceDetail['attack']) {
        reduceDetail['attack'] = statSum1['attack'] * 1.2 ;
      }
      reduceDetail['attack'] = reduceDetail['attack'] + statSum1['attack'] * 1.2 ;

      if (!reduceDetail['ranged']) {
        reduceDetail['ranged'] = statSum1['ranged'] * 1.5 ;
      }
      reduceDetail['ranged'] = reduceDetail['ranged'] + statSum1['ranged'] * 1.5 ;

      if (!reduceDetail['magic']) {
        reduceDetail['magic'] = statSum1['magic'] * 2 ;
      }
      reduceDetail['magic'] = reduceDetail['magic'] + statSum1['magic'] * 2;

      if (!reduceDetail['armor']) {
        reduceDetail['armor'] = statSum1['armor'];
      }
      reduceDetail['armor'] = reduceDetail['armor'] + statSum1['armor'];

      if (!reduceDetail['health']) {
        reduceDetail['health'] = statSum1['health'];
      }
      reduceDetail['health'] = reduceDetail['health'] + statSum1['health'];

      if (!reduceDetail['speed']) {
        reduceDetail['speed'] = statSum1['speed'];
      }
      reduceDetail['speed'] = reduceDetail['speed'] + statSum1['speed'];
    }
  })
  let entries = Object.entries(reduceDetail);
  let sorted = entries.sort((a, b) => b[1] - a[1]);
  return  sorted;
}


function getEnemyTeamPerfer(input, mana) {
  let recentTeamManaMap = {};
  let itemMana = 0;
  let newItem = [];
  input.forEach((x) => {
    let name = x[0];
    let detail = cardsDetailsNameMap[name];
    if(detail){
      let statSum1 = detail['statSum1'];
      if(detail['type'] ==  'Summoner'){
        // 非第一次，每次遇到新的
        if(itemMana != 0){
          recentTeamManaMap[itemMana] = newItem;
          itemMana = 0;
          newItem = [];
        }
        itemMana = statSum1['mana'];
        newItem.push(detail)
      } else {
        itemMana = itemMana + statSum1['mana'];
        newItem.push(detail)
      }
    }
  })
  if(itemMana != 0){
    recentTeamManaMap[itemMana] = newItem;
  }

  console.log(JSON.stringify(recentTeamManaMap))

  let matchTeams = {};
  let delta = 3;
  Object.keys(recentTeamManaMap).forEach(function (tz) {
     if(parseInt(mana) - delta <= tz && tz <= parseInt(mana) + delta){
       matchTeams[recentTeamManaMap[tz][0]['name']] = recentTeamManaMap[tz];
     }
  });

  console.log('target:', mana, ' delta:', delta , " size : " + Object.keys(matchTeams).length , "   " ,JSON.stringify(matchTeams))
  return  matchTeams;
}


function getSuitBattleSummoner(enemyRecentInfo,perferSummoners){
  var most = enemyRecentInfo[0];
  var secondMost = enemyRecentInfo[1];
  let perferSummonersInfo = getEnemyBufferRecentInfo(perferSummoners.map(summoner => [summoner,"1"]),"Summoner")
  Object.keys(defaultRules).forEach( type =>{
    if(checkType(type,most,secondMost,perferSummonersInfo)){
      return defaultRules[type];
    }
  })
}

function checkType(target,most, secondMost, perferSummonersInfo) {
  if(most == target || secondMost == target || perferSummonersInfo[target] > 0){
      return true;
  } else {
    return false;
  }
}

exports.cardsDetailsNameMap = cardsDetailsNameMap;
exports.cardsDetailsIDMap = cardsDetailsIDMap;
exports.getEnemyBufferRecentInfo = getEnemyBufferRecentInfo;
exports.getEnemyTeamPerfer = getEnemyTeamPerfer;
exports.getSuitBattleSummoner = getSuitBattleSummoner;


let test = [["Kelya Frendul","1"],["Serpent of Eld","1"],["Elven Defender","1"],["Flying Squid","1"],["Mantoid","1"],["Deeplurker","1"],["Goblin Chariot","1"],["Kelya Frendul","1"],["Serpent of Eld","1"],["Merdaali Guardian","1"],["Deeplurker","1"],["Ice Pixie","1"],["Albatross","1"],["",""],["Thaddius Brood","1"],["Cursed Windeku","1"],["Carrion Shade","1"],["Death Elemental","1"],["",""],["",""],["",""],["Obsidian","1"],["Unicorn Mustang","1"],["Mycelic Slipspawn","1"],["Goblin Psychic","1"],["Khmer Princess","1"],["",""],["",""],["Kelya Frendul","1"],["Hardy Stonefish","1"],["Albatross","1"],["Ice Pixie","1"],["Deeplurker","1"],["",""],["",""]]


console.log(JSON.stringify(getEnemyBufferRecentInfo(test,"Summoner")))
// var enemyTeamPerfer = getEnemyTeamPerfer(test,"16");
// console.log(JSON.stringify(Object.keys(enemyTeamPerfer)))
