const fetch = require("node-fetch");
const fs = require('fs');

async function getTopBattleHistory(leaderboard) {
  const battleHistory = await fetch(
      'https://api2.splinterlands.com/battle/history2?player=%24top&leaderboard='
      + leaderboard + '&v=1640391366759&token=AN01RUV8U8&username=sugelafei2')
  .then((response) => {
    if (!response.ok) {
      console.log('Network response was not ok');
      return {'battles': []}
    }
    return response;
  })
  .then((battleHistory) => {
    return battleHistory.json();
  })
  .catch((error) => {
    console.error('There has been a problem with your fetch operation:', error);
  });

  let rsArray = []
  battleHistory.battles.map(x => {
    if (x.details.team1 && x.details.team1.player) {
      rsArray.push(x.details.team1.player);
    }
    if (x.details.team2 && x.details.team2.player) {
      rsArray.push(x.details.team2.player)
    }
  })
  return rsArray;
}

async function getLeaderboardBattleHistory(leaderboard) {
  const battleHistory = await fetch(
      'https://cache-api.splinterlands.com/players/leaderboard_with_player?season=77&leaderboard='
      + leaderboard + '&v=1640393129081&token=AN01RUV8U8&username=sugelafei2')
  .then((response) => {
    if (!response.ok) {
      console.log('Network response was not ok');
      return {'battles': []}
    }
    return response;
  })
  .then((battleHistory) => {
    return battleHistory.json();
  })
  .catch((error) => {
    console.error('There has been a problem with your fetch operation:', error);
  });
  let rsArray = []
  battleHistory.leaderboard.map(x => {
    if (x.player) {
      rsArray.push(x.player)
    }
  })
  return rsArray;
}

async function getBattleHistory() {
  var battleHistory1 = await getTopBattleHistory(0);
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(1))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(2))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(3))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(4))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(5))

  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(0))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(1))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(2))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(3))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(4))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(5))
  console.log("getBattleHistory .........", battleHistory1.length)
  return battleHistory1;
}

async function saveBattlesHistory() {
  console.log("--------------saveBattlesHistory---------------")
  await getBattleHistory().then(player => {
    fs.writeFile(`data/initUsers/topBattleUserJSON.json`, JSON.stringify(player), function (err) {
      if (err) {
        console.log(err);
      }
    });
    // console.log(users.filter(distinct))
  })
}

module.exports.saveBattlesHistory = saveBattlesHistory;

// (async ()=>{
//   let l1 =  await getBattleHistory()
//   // console.log(JSON.stringify(l1))
//
//
// })()