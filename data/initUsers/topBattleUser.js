const fetch = require("node-fetch");
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const proxyAgent = new HttpsProxyAgent('http://192.168.99.1:1081');

//https://api2.splinterlands.com/battle/history2?player=$top&leaderboard=1&format=wild&v=1657933584115&token=O8WX6PK9KG&username=xgq123
async function getTopBattleHistory(leaderboard,format) {
  const url = 'https://api2.splinterlands.com/battle/history2?player=$top&leaderboard='
  + leaderboard + '&format='+format+'&v=1657933584115&token=O8WX6PK9KG&username=xgq123'
  console.log(url)
  const battleHistory = await fetch(url
      // , { agent: proxyAgent}
      )
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

// https://api2.splinterlands.com/players/leaderboard_with_player?season=91&leaderboard=1&format=wild&v=1657932718267&token=O8WX6PK9KG&username=xgq123
async function getLeaderboardBattleHistory(leaderboard,format) {
  const battleHistory = await fetch(
      'https://api2.splinterlands.com/players/leaderboard_with_player?season=91&leaderboard='
      + leaderboard + '&format='+format+'&v=1657932718267&token=O8WX6PK9KG&username=xgq123'
      // , { agent: proxyAgent}
      )
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

async function getBattleHistory(format) {
  var battleHistory1 = await getTopBattleHistory(0,format);
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(1,format))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(2,format))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(3,format))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(4,format))
  battleHistory1 = battleHistory1.concat(await getTopBattleHistory(5,format))


  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(0,format))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(1,format))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(2,format))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(3,format))
  battleHistory1 = battleHistory1.concat(await getLeaderboardBattleHistory(4,format))

  console.log("getBattleHistory .........", battleHistory1.length)
  return battleHistory1;
}

async function saveBattlesHistory() {
  console.log("--------------saveBattlesHistory---------------")
  await getBattleHistory('modern').then(player => {
    fs.writeFile('data/initUsers/modern_topBattleUserJSON.json', JSON.stringify(player), function (err) {
      if (err) {
        console.log(err);
      }
    });
    // console.log(users.filter(distinct))
  })

  // await getBattleHistory('wild').then(player => {
  //   fs.writeFile('data/initUsers/wild_topBattleUserJSON.json', JSON.stringify(player), function (err) {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  //   // console.log(users.filter(distinct))
  // })

}

module.exports.saveBattlesHistory = saveBattlesHistory;

(async ()=>{

  // wild modern
 //await saveBattlesHistory()
  // console.log(JSON.stringify(l1))


})()