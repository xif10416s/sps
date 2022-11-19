var http = require('http');
var fs = require('fs');
var url = require('url');
const user = require('../../userV2');
const ptm = require('../../possibleTeams');
const battlesGet = require('../../battlesGet');
const cardDetail = require('../../data/cardsDetails');
const dbAnalysis = require('../../db/script/analysis');
const mostUsefullMonster = require('../../db/data/mostUsefull');
const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon'];
const dbUtils = require('../../db/script/dbUtils');
const cardsDetail = require('../../data/cardsDetails');

const cardMap = {}
for(var k in cardsDetail.cardsDetailsNameMap) {
  cardMap[k.toLowerCase()] = cardsDetail.cardsDetailsNameMap[k]
}
function calcTotalMana(team) {
  let totalMana = 0 ;
  team.slice(0,7).forEach(item =>{
    if(cardDetail.cardsDetailsIDMap[item]){
      const mana = parseInt(cardDetail.cardsDetailsIDMap[item]['statSum1']['mana'])
      totalMana +=mana
    }
  })
  return totalMana;
}

function parseTeam(teams) {
  const recent_team = []
  for(let j = 0 ; j < teams.length ; j++ ){
    const teamTitles = teams[j]
    let parseTeam = {};
    let totalMana = 0;
    for (let i = 0; i < teamTitles.length; i++) {
      const titleAttr =  teamTitles[i]
      if(titleAttr != null){

        let sp = titleAttr.split('â\x98\x85')
        // console.log("sp ---" ,sp[0].trim())
        const cardId = cardMap[sp[0].trim()]['cardDetailId'];
        const cardLevel = parseInt(sp[1].trim())
        const mana = parseInt(cardMap[sp[0].trim()]['statSum1']['mana'])
        totalMana +=mana;
        if(i == 0) {
          parseTeam['summoner_id'] = cardId
          parseTeam['summoner_level'] = cardLevel
        } else {
          parseTeam['monster_'+i+'_id'] = cardId
          parseTeam['monster_'+i+'_level'] = cardLevel
        }
      } else {
        parseTeam['monster_'+i+'_id'] = ''
        parseTeam['monster_'+i+'_level'] = ''
      }
    }
    parseTeam['mana_cap']=totalMana
    recent_team.push(parseTeam)
  }
  return recent_team;
}


// 创建服务器
http.createServer(async function (request, response) {
  // 解析请求，包括文件名
  var pathname = url.parse(request.url).pathname;
  let ranked = "M"
  if (pathname.startsWith("/api")) {
    console.log("获取到的请求参数的路径：" + request.url);
    let arg1 = url.parse(request.url, true).query;
    if (pathname.startsWith("/api/search")) {
      let rule = arg1.rule;
      rule = rule.replace(" and"," &").replace(" and"," &").replace(" and"," &");
      let mana = arg1.mana;
      let enemy = JSON.parse(arg1.enemy)
      // console.log("enemy : " , enemy)
      let sp = arg1.sp
      let rateNum = parseInt(arg1.rateNum.replace(",",""))
      if (sp == '') {
        sp = splinters;
      } else {
        sp = sp.slice(0, sp.length - 1).split("|")
      }
      let player = arg1.player
      console.log(rule, mana, enemy, sp, player)
      // const enemyRecentTeams = await battlesGet.getBattleDetail(enemy)
      // const enemyRecentTeams = []

      let enemyRecentTeams = parseTeam(enemy)
      console.log("enemyRecentTeams :" ,enemyRecentTeams)
      let myCards = []
      try {
        delete require.cache[require.resolve("../../data/playcards/" + player + "_cards")]
        myCards = require("../../data/playcards/" + player + "_cards")
        if(ranked == "M"){
          console.log(' MODEN CARD deck size: '+myCards.length, "min id :",Math.min.apply(null,myCards))
          myCards = cardsDetail.doModernFilter(myCards);
          console.log('filed MODEN CARD deck size: '+myCards.length, "min id :",Math.min.apply(null,myCards))
        }

      } catch (e) {
        return {msg: "error"}
      }

      console.log(myCards.indexOf(339),myCards.length)
      const [cards ,idMap] = await  user.getPlayerCardsV2(player)
      const matchDetails = {
        orgMana: mana,
        mana: mana,
        rules: rule,
        rating: rateNum,
        splinters: sp,
        idMap:idMap,
        myCards: myCards,
        enemyRecent: enemyRecentTeams,
        ranked: ranked,
        enemyPossbileTeams: enemyRecentTeams,
        logContent: {}
      }

      console.time("battle")
      let possibleTeams = await ptm.possibleTeams(matchDetails, player).catch(
          e => console.log('Error from possible team API call: ', e));
      console.timeLog("battle","1 possibleTeams finished")
      console.log("possibleTeams-----------",possibleTeams.length)
      if (possibleTeams && possibleTeams.length) {
        console.log('1 Possible Teams based on your cards: ',
            possibleTeams.length);
      } else {
        console.log('NO TEAMS available to be played');
        return;
      }

      const result = await ptm.teamSelectionForWeb(possibleTeams, matchDetails);
      if (result) {
        if (result.mostWinTeam) {
          result.mostWinTeam = result.mostWinTeam.map(cardId => {
            let card = cardDetail.cardsDetailsIDMap[cardId];
            if (card) {
              return card["name"]
            } else {
              // console.log("----------:",card)
              return cardId;
            }
          })
        }

        if (result.mostBcTeam) {
          result.mostBcTeam = result.mostBcTeam.map(cardId => {
            let card = cardDetail.cardsDetailsIDMap[cardId];
            if (card) {
              return card["name"]
            } else {
              // console.log("----------:",card)
              return cardId;
            }
          })
        }

        if (result.mostByCsTeam) {
          result.mostByCsTeam = result.mostByCsTeam.map(cardId => {
            let card = cardDetail.cardsDetailsIDMap[cardId];
            if (card) {
              return card["name"]
            } else {
              // console.log("----------:",card)
              return cardId;
            }
          })
        }

        console.log("-----mostEnemyAgainstTeam---"+ result.mostEnemyAgainstTeam)
        if (result.mostEnemyAgainstTeam) {
          result.mostEnemyAgainstTeam = result.mostEnemyAgainstTeam.map(
              cardId => {
                let card = cardDetail.cardsDetailsIDMap[cardId];
                if (card) {
                  return card["name"]
                } else {
                  // console.log("----------:",card)
                  return cardId;
                }
              })
        }

        if (result.mostAgainstrevertTeam) {
          result.mostAgainstrevertTeam = result.mostAgainstrevertTeam.map(
              cardId => {
                let card = cardDetail.cardsDetailsIDMap[cardId];
                if (card) {
                  return card["name"]
                } else {
                  // console.log("----------:",card)
                  return cardId;
                }
              })
        }

        if (result.summoners) {
          Object.keys(result.summoners).forEach(sum => {
            result.summoners[sum] = result.summoners[sum].map(cardId => {
              let card = cardDetail.cardsDetailsIDMap[cardId];
              if (card) {
                return card["name"]
              } else {
                // console.log("----------:",card)
                return cardId;
              }
            })
          })

        }
      }
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.write(JSON.stringify(result))
      response.end()
      return;
    }

    //------------------------------
    if (pathname.startsWith("/api/analysis")) {
      let fromScore = arg1.fromScore;
      let endScore = arg1.endScore;
      let rule = arg1.rule;
      console.log("------------",rule,fromScore)




      console.log("/api/analysis ...........",rule)
      const result = mostUsefullMonster.slice(0, 200);
      result.forEach(item => {
        const cardInfo = cardDetail.cardsDetailsIDMap[item['id']];
        item['name'] = cardInfo['name'];
      })

      // let mostByRule = [];
      //
      //   try {
      //     mostByRule = require(
      //         "../../data/ruleswin/" + rule.replace("|", "_") + "_cards")
      //   } catch (e) {
      //     if (rule.length > 1) {
      //       let rules = rule.split("|");
      //       let reserve = rules[1] + "_" + rules[0]
      //       try {
      //         mostByRule = require("../../data/ruleswin/" + reserve + "_cards")
      //       } catch (e) {
      //       }
      //     }
      //   }
      //
      //   if (mostByRule && mostByRule.length == 0) {
      //     rule = rule.replace("and","&").replace("and","&").replace("and","&");
      //     mostByRule = await dbAnalysis.getMostUsefullMonster(fromScore,
      //         endScore, rule);
      //     mostByRule.forEach(item => {
      //       const cardInfo = cardDetail.cardsDetailsIDMap[item['id']];
      //       item['name'] = cardInfo['name'];
      //     })
      //
      //     fs.writeFile(`data/ruleswin/${rule.replace("|", "_")}_cards.json`,
      //         JSON.stringify(mostByRule), function (err) {
      //           if (err) {
      //             console.log(err);
      //           }
      //         });
      //   }


      response.writeHead(200, {'Content-Type': 'application/json'});
      response.write(JSON.stringify({mostUser: result, mostByRule: []}))
      response.end()
      return;
    }

    //------------------------------
    if (pathname.startsWith("/api/csAnalysis")) {
      let cs = arg1.cs;
      let result = []
      cs.split("-").forEach(item => {
        const cardInfo = cardDetail.cardsDetailsIDMap[item];
        if(cardInfo) {
          result.push({"name": cardInfo['name']})
        } else {
          console.log("-------------",item)
        }

      })

      const total = calcTotalMana(cs.split("-"))
      result.push({"name": total})

      response.writeHead(200, {'Content-Type': 'application/json'});
      response.write(JSON.stringify({mostUser: result}))
      response.end()
      return;
    }

    //------------------------------
    if (pathname.startsWith("/api/cs2Analysis")) {
      let from = arg1.from;
      let end = arg1.end;
      let rule = arg1.rule;
      let lenSql = arg1.len && arg1.len != '' ? ' len = '+ arg1.len + ' and ': '' ;
      let ruleSql = rule &&  rule != "-1" ? " rule like '%" +rule+"%'" :" 1=1 "

      let sp = arg1.sp
      if (sp == '') {
        sp = splinters;
      } else {
        sp = sp.slice(0, sp.length - 1).split("|")
      }

      const sms =  ptm.getSplintersSummoners(sp)

      const topCsLikeSql = sms.map( cs => {
        return   " cs like '" + cs+"-%' "
      }).join(" or ")

      console.table(topCsLikeSql)

      // ruleSql = " 1=1 "
      let sql = " select cs , sum(teams) as ts ,sum(lostTeams) as lts  , sum(totalCnt) as tt , sum(lostTotalCnt) as lts , sum(teams)/sum(teams+lostTeams) as tl from battle_stat_v1 where "
          +  lenSql + " startMana >= "+ from +"  and  startMana <= "+ end +" and "+ ruleSql + " and ("+ topCsLikeSql +") GROUP BY cs  HAVING   sum(teams) > 3   and tl >= 0.70  order by  len asc,  tl desc  ,sum(teams -lostTeams ) desc limit 30"

      let data = await dbUtils.sqlQuery(sql);
      let string = JSON.stringify(data);
      let rs = JSON.parse(string)
      let result = []
      rs.forEach(item => {
        let teams = []
        item['cs'].split("-").forEach(item => {
          const cardInfo = cardDetail.cardsDetailsIDMap[item];
          teams.push(cardInfo['name'])
        })
        result.push({teams: teams,tl: item['tl'],wt:item['ts'] , lt:item['lts']})
      })


      response.writeHead(200, {'Content-Type': 'application/json'});
      response.write(JSON.stringify({mostCS: result}))
      response.end()
      return;
    }

    if (pathname.startsWith("/api/init")) {
      let player = arg1.player;
      const [cards ,idMap] = await  user.getPlayerCardsV2(player)
      console.log("playcards: ",JSON.stringify(cards))
      fs.writeFile(`data/playcards/${player}_cards.json`, JSON.stringify(cards),
          function (err) {
            if (err) {
              console.log(err);
            }
      });

      response.write(player)
      response.end()
      return;
    }

  }

  if (pathname.startsWith("/api/explorer")) {

    response.writeHead(200, {'Content-Type': 'application/json'});
    response.write(JSON.stringify({htmlStr: htmlStr}))
    response.end()
    return;
  }

  if (pathname.endsWith(".webp")) {
    console.log('----------------src\\server\\images\\' + pathname.substr(1))
    fs.readFile('src\\server\\images\\' + pathname.substr(1),
        function (err, data) {
          if (err) {
            console.log(err);
            // HTTP 状态码: 404 : NOT FOUND
            // Content Type: text/html
            response.writeHead(404, {'Content-Type': 'text/html'});
          } else {
            response.writeHead(200, {'Content-Type': 'image/webp'});
            response.end(data);
          }
          //  发送响应数据
          response.end();
        });
    return;
  }

  if (pathname.endsWith(".jpg")) {
    console.log('----------------src\\server\\images\\' + pathname.substr(1))
    fs.readFile('src\\server\\images\\' + pathname.substr(1),
        function (err, data) {
          if (err) {
            console.log(err);
            // HTTP 状态码: 404 : NOT FOUND
            // Content Type: text/html
            response.writeHead(404, {'Content-Type': 'text/html'});
          } else {
            response.writeHead(200, {'Content-Type': 'image/webp'});
            response.end(data);
          }
          //  发送响应数据
          response.end();
        });
    return;
  }

  if (pathname.endsWith(".png")) {
    console.log('----------------src\\server\\sps\\' + pathname.substr(1))
    fs.readFile('src\\server\\sps\\' + pathname.substr(1),
        function (err, data) {
          if (err) {
            console.log(err);
            // HTTP 状态码: 404 : NOT FOUND
            // Content Type: text/html
            response.writeHead(404, {'Content-Type': 'text/html'});
          } else {
            response.writeHead(200, {'Content-Type': 'image/webp'});
            response.end(data);
          }
          //  发送响应数据
          response.end();
        });
    return;
  }

  if (pathname == "" || pathname == "/") {
    pathname = "/index.html"
  }
  // 输出请求的文件名
  console.log("Request for " + pathname + " received.");

  // 从文件系统中读取请求的文件内容
  fs.readFile('src\\server\\' + pathname.substr(1), function (err, data) {
    if (err) {
      console.log(err);
      // HTTP 状态码: 404 : NOT FOUND
      // Content Type: text/html
      response.writeHead(404, {'Content-Type': 'text/html'});
    } else {
      // HTTP 状态码: 200 : OK
      // Content Type: text/html
      response.writeHead(200, {'Content-Type': 'text/html'});

      // 响应文件内容
      response.write(data.toString());
    }
    //  发送响应数据
    response.end();
  });
}).listen(8080);
