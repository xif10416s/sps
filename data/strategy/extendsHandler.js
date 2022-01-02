const extendStrategy = require("./extendStragy").sort((a,b) =>  a['order'] - b['order'])
const cardsDetails = require("../cardsDetails")

function doExtendsHandler(team, ruleset, myCards) {
  console.log("---doExtendsHandler---start----",JSON.stringify(team),JSON.stringify(myCards))
  if (team == null || team.length == 0 || extendStrategy == null || extendStrategy.length == 0) {
    return team;
  }
  try{
    extendStrategy.forEach(stg => {
      const name = stg["name"];
      const cardInfo = cardsDetails.cardsDetailsNameMap[name];
      // check owner
      if (cardInfo && myCards.indexOf(cardInfo['cardDetailId']) != -1 && team.indexOf(cardInfo['cardDetailId']) == -1) {
        // check rule set
        const skipRules = stg["skipRules"];
        if (skipRules && skipRules.length > 0) {
          let needSkip = false;
          skipRules.forEach(rule => {
            if (ruleset.indexOf(rule) != -1) {
              needSkip = true;
            }
          })
          if (needSkip) {
            console.log("skipRules match ....")
            return;
          }
        }
        // check team max length
        let teamLen = 0;
        team.slice(1, 7).forEach(ms => {
          if (ms != null && ms != '') {
            teamLen++;
          }
        })
        if (teamLen > parseInt(stg["monsterMaxSize"])) {
          return;
        }

        // replace or insert
        switch (stg['positionStrategy']) {
          case 1:
            team = doInsert(team, cardInfo['cardDetailId'], stg['position'][0]);
            break;
          case 2:
            team = doReplace(team, cardInfo['cardDetailId'], stg['position'],cardInfo);
            break;
          default:
        }
      }
    })
  } catch (e) {
    console.log("---doExtendsHandler---error----",e)
  }
  return team;
}

function doInsert(team, cardId, position) {
  console.log("doInsert :",cardId)
  team.splice(position, 0, cardId);
  team.splice(7, 1);
  return team;
}

function doReplace(team, cardId, position, cardInfo) {
  const cardMana = cardInfo['statSum1']['mana'];
  for (let i = 0; i < position.length; i++) {
    const ps = position[i];
    const orgInfo = cardsDetails.cardsDetailsIDMap[team[ps]]
    if(orgInfo){
      if (parseInt(orgInfo['statSum1']['mana']) == parseInt(cardMana)) {
        console.log("do replace :", cardId)
        team.splice(ps, 1, cardId);
        break;
      }
    }
  }
  return team;
}

module.exports.doExtendsHandler = doExtendsHandler;

// const team1 = [438, 227, 96, 97,92 , 378, '', 'death', '', '',
//   '52c7e234cfc3716ce0b6fdf8e9a5f1720849a974']
// console.log(
//     JSON.stringify(
//         doExtendsHandler(team1, "Odd2 Ones Out|dd", [131, 361, 111,91])));