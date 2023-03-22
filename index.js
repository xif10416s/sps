//'use strict';
const puppeteer = require('puppeteer');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./userV2');
const card = require('./cards');
const {clickOnElement, getElementText, getElementTextByXpath, teamActualSplinterToPlay, sleep, reload} = require(
    './helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const chalk = require('chalk');
const fs = require('fs');
const cardsDetail = require('./data/cardsDetails');

let account = '';
let password = '';
let totalDec = 0;
let winTotal = 0;
let loseTotal = 0;
let undefinedTotal = 0;
let dailyClaim = false;
let claimTime = "-"
let runFlgCnt = 0;
let errorCnt = 0;
let runStat = false;
let cardNoClickCnt = 0;
let winMap = {"ml-T":0 , "ml-F":0 , "mts-T": 0 , "mts-F":0 , "sm-T":0 ,"sm-F":0 ,"cs-T": 0 , "cs-F":0 , "cnt": 0}


const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let statFile = './logs/stat.csv';
const statHeader = [
  {id: 'account', title: 'account'},
  {id: 'isWin', title: 'isWin'},
  {id: 'mana', title: 'mana'},
  {id: 'rules', title: 'rules'},
  {id: 'splinters', title: 'splinters'},
  {id: 'possibleTeams', title: 'possibleTeams'},
  {id: 'QuestMatch', title: 'QuestMatch'},
  {id: 'strategy', title: 'strategy'},
  {id: 'isMatchPrefer', title: 'isMatchPrefer'},
  {id: 'stgLen', title: 'stgLen'},
  {id: 'rating', title: 'rating'},
  {id: 'tm', title: 'tm'},
  {id: 'type', title: 'type'},
]
let csvWriter = createCsvWriter({
  path: statFile,
  header: statHeader,
  append: true
});

const summaryFile = fs.createWriteStream('./logs/Summary.txt', {'flags': 'a'});
const summaryErrorFile = fs.createWriteStream('./logs/SummaryError.txt',
    {'flags': 'a'});
const summaryWinFile = fs.createWriteStream('./logs/SummaryWin.txt',
    {'flags': 'a'});
let summaryLogger = new console.Console(summaryFile, summaryFile);
let summaryErrorLogger = new console.Console(summaryErrorFile, summaryErrorFile);
let summaryWinLogger = new console.Console(summaryWinFile, summaryWinFile);

async function getQuest(page) {
  try {
    const splinter = await getElementText(page, "#quest_title1");
    const total = await getElementText(page, "#quest_chest_total_text")
    const completed = await getElementText(page, "#quest_chest_progress_text")
    const nct = await getElementText(page, "#complete_text")
    const fc = await getElementText(page, "#quest_chests_earned")

    return {
      splinter: splinter.trim().toLowerCase(),
      total: parseInt(total.replaceAll(",", "")),
      completed: parseInt(completed.replaceAll(",", "")),
      nct: nct.replaceAll(" ", ""),
      fc: parseInt(fc)
    }
  } catch (e) {
    console.log(e)
  }
  return null;
}

async function closePopups(page) {
  console.log('check if any modal needs to be closed...')
  if (await clickOnElement(page, '.close', 4000)) {
    return;
  }
  await clickOnElement(page, '.modal-close-new', 1000, 2000);
  await clickOnElement(page, '.modal-close', 4000, 2000);
}

async function checkLeague(page) {
  try {
    const league = await getElementText(page, "#current_league_text");
    if (league) {
      console.log(
          chalk.bold.whiteBright.bgMagenta('Your current league is ' + league));
      // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
      return league
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('league not defined'));
  }
}

async function checkSeasonRewards(page) {
  try {
    const src = await getElementText(page, "#pack_rewards");
    if (src) {
      console.log(chalk.bold.whiteBright.bgMagenta(
          'Your current pack_rewards is ' + src));
      // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
      return src
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('pack_rewards not defined'));
  }
}

//
async function checkEcr(page) {
  try {
    const ecr = await getElementTextByXpath(page,
        '//*[@id="total_energy"]', 3000);
    if (ecr) {
      console.log(chalk.bold.whiteBright.bgMagenta(
          'Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
      // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
      return parseInt(ecr)
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('ECR not defined'));
  }
}

async function checkDec(page) {
  try {
    const dec = await getElementText(page,
        "#bs-example-navbar-collapse-1 > ul.nav.navbar-nav.navbar-right > li:nth-child(2) > div.dec-container > div.balance",
        3000);
    if (dec) {
      console.log(chalk.bold.whiteBright.bgMagenta('Your current Dec ' + dec));
      // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
      return parseInt(dec.replaceAll(",", ""))
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('dec not defined'));
  }
}

async function checkNextQuest(page) {
  try {
    let nextQuest = await getElementTextByXpath(page,
        '//*[@id="complete_text"]', 3000);
    if (nextQuest) {
      nextQuest = nextQuest.toString().replace("Next quest available in: ", "")
      console.log(chalk.bold.whiteBright.bgMagenta(
          'Your next Quest time is : ' + nextQuest));
      return nextQuest.toString().trim()
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('next Quest time not defined'));
  }
}

async function checkRating(page) {

  try {
    let rating = await getElementTextByXpath(page,
        '//*[@id="about_player__status"]/div[1]/div[2]/div/div/div[2]/div[1]/div[1]/span[2]',
        3000);
    if (rating) {
      rating = rating.replaceAll(",", "").replaceAll("(", "").replaceAll(")",
          "")
      console.log(
          chalk.bold.whiteBright.bgMagenta('Your current Rate is ' + rating));
      return parseFloat(rating)
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('rating not defined'));
  }
}

async function checkPower(page) {

  try {
    const power = await getElementTextByXpath(page,
        '//*[@id="power_progress"]/div[1]/span[2]', 3000);
    if (power) {
      console.log(
          chalk.bold.whiteBright.bgMagenta('Your current power is ' + power));
      return parseInt(power.replace(",", ""))
    }
  } catch (e) {
    console.log(chalk.bold.redBright.bgBlack('power not defined'));
  }
}

async function uplevelLeage(page) {
  try {
    await page.click('#adv_btn_container > button')
    .then(() => page.waitForTimeout(1000))
    .then(() => {
      page.keyboard.press('Enter');
    })
    .then(() => page.waitForTimeout(5000))
    .then(async a => {
      await page.reload();
      console.log('uplevelLeage  requested')
    })
    .catch(e => console.log('Cannot click on up level leage'))
  } catch (e) {
    console.log('Error while click on up level leage')
  }
}

async function setRankedMode(page) {
  let RANKED = "W"
  // select model  #bh_wild_toggle  #bh_modern_toggle
  if (process.env.RANKED == "M") {
    await page.click('#bh_modern_toggle')
    .then(() => {
      page.waitForTimeout(5000);
      RANKED = "M"
      console.log('=====select Modern success ========')
    })
    .catch(e => console.log('=====select Modern error ========'))
  } else {
    await page.click('#bh_wild_toggle')
    .then(() => {
      page.waitForTimeout(5000);
      RANKED = "W"
      console.log('=====select WILD success ========')
    })
    .catch(e => console.log('=====select WILD error ========'))
  }
}

async function findSeekingEnemyModal(page, visibleTimeout = 15000) {
  let findOpponentDialogStatus = 0;
  /*  findOpponentDialogStatus value list
      0: modal #find_opponent_dialog has not appeared
      1: modal #find_opponent_dialog has appeared and not closed
      2: modal #find_opponent_dialog has appeared and closed
  */

  console.log('check #find_opponent_dialog modal visibility');
  findOpponentDialogStatus = await page.waitForSelector('#find_opponent_dialog',
      {timeout: visibleTimeout, visible: true})
  .then(() => {
    console.log('#########3#########find_opponent_dialog visible');
    return 1;
  })
  .catch((e) => {
    console.log(e.message);
    return 0;
  });

  if (findOpponentDialogStatus === 1) {
    console.log('waiting for an opponent...');
    findOpponentDialogStatus = await page.waitForSelector(
        '#find_opponent_dialog', {timeout: 90000, hidden: true})
    .then(() => {
      console.log('#########4##########find_opponent_dialog has closed');
      return 2;
    })
    .catch((e) => {
      console.log(e.message);
      return 1;
    });
  }

  return findOpponentDialogStatus
}

async function findCreateTeamButton(page, findOpponentDialogStatus = 0,
    btnCreateTeamTimeout = 30000) {
  console.log(`findCreateTeamButton waiting for create team button: `,
      findOpponentDialogStatus);
  //#enemy_found_ranked > div > div > div.modal-body > div > div:nth-child(2) > button
  //#enemy_found_ranked > div > div > div.modal-body > div > div:nth-child(2) > button
  const startDate = new Date();
  const createTeamSelecotr = '#enemy_found_ranked > div > div > div.modal-body > div > div:nth-child(2) > button'
  // let startFlag =  await page.waitForXPath('//*[@id="dialog_container"]/div/div/div/div[2]/div[3]/div[2]/button', { timeout: btnCreateTeamTimeout, visible: true })
  let startFlag = await page.waitForSelector(createTeamSelecotr,
      {timeout: btnCreateTeamTimeout, visible: true})
  .then(() => {
    console.log('############6##########start the match Selector:',
        (new Date().getTime() - startDate.getTime()) / 1000);
    return true;
  })
  .catch(async () => {
    if (findOpponentDialogStatus === 2) {
      console.log(
          'Is this account timed out from battle?');
    }
    console.log('btn--create-team not detected:Selector');
    return false;
  });
  console.log("findCreateTeamButton startFlag ", startFlag)
  if (!startFlag) {
    const createTeamXpath = '//*[@id="enemy_found_ranked"]/div/div/div[2]/div/div[2]/button'
    return await page.waitForXPath(createTeamXpath,
        {timeout: btnCreateTeamTimeout * 2, visible: true})
    .then(() => {
      console.log('########6_1########start the match again :',
          (new Date().getTime() - startDate.getTime()) / 1000);
      return true;
    })
    .catch(async () => {
      if (findOpponentDialogStatus === 2) {
        console.log(
            'Is this account timed out from battle?');
      }
      console.log('btn--create-team not detected:XPath');
      return false;
    });
  } else {
    return startFlag;
  }
}

// start battle : <Battle> btn click
async function launchBattle(page) {
  const maxRetries = 3;
  let retriesNum = 1;
  let btnCreateTeamTimeout = 50000 * 2;
  // 1  pre battle:  check is already start a battle and search enemy
  let findOpponentDialogStatus = await findSeekingEnemyModal(page);
  // 1.1  pre battle: create team
  console.log('####for pre start battles start .................findCreateTeamButton')
  let isStartBattleSuccess = await findCreateTeamButton(page,
      findOpponentDialogStatus);

  console.log('###1####new battle start ..........................')
  while (!isStartBattleSuccess && retriesNum <= maxRetries) {
    console.log(`Launch battle iter-[${retriesNum}]`)
    if (findOpponentDialogStatus === 0) {
      console.log('waiting for battle button')
      // 2  wait BATTLE btn and click start battle , new battle
      isStartBattleSuccess = await page.waitForXPath(
          "//*[@id='battle_category_btn']", {timeout: 30000,visible: true})
      .then(button => {
        button.click();
        console.log('#########2#########Battle button clicked');
        return true
      })
      .catch(() => {
        console.error(
            '[ERROR] waiting for Battle button. is Splinterlands in maintenance?');
        return false;
      });
      if (!isStartBattleSuccess) {
        await reload(page);
        await sleep(5000);
        retriesNum++;
        continue
      }
      // 3  search enemy dialog modal
      findOpponentDialogStatus = await findSeekingEnemyModal(page);
    }

    console.log("findOpponentDialogStatus : ", findOpponentDialogStatus)
    if (findOpponentDialogStatus === 1 || findOpponentDialogStatus === 2) {
      if (findOpponentDialogStatus === 2) {
        console.log('opponent found?');
        btnCreateTeamTimeout = 5000;
      }
      isStartBattleSuccess = await findCreateTeamButton(page,
          findOpponentDialogStatus, btnCreateTeamTimeout);
    }

    if (!isStartBattleSuccess) {
      console.error('Refreshing the page and retrying to retrieve a battle');
      await reload(page);
      await sleep(5000);
    }

    retriesNum++;
  }

  return isStartBattleSuccess
}

async function clickSummonerCard(page, teamToPlay) {
  let clicked = true;
  ////*[contains(@id, '-259-')]/img
  await page.waitForXPath(`//*[contains(@id, "-${teamToPlay.summoner}-")]/img`,
      {timeout: 15000})
  .then(card => {
    card.focus();
    page.waitForTimeout(500)
    console.log("summoner card visable....")
    card.click()
    .then(() =>console.log(chalk.bold.greenBright(teamToPlay.summoner,
        'summoner clicked xpath contaions.')))
    .catch(e =>{
      clicked = false;
      console.log(chalk.bold.redBright('Summoner not clicked contains.',e))
    })
  })
  .catch((e) => {
    clicked = false;
    console.log(chalk.bold.redBright('Summoner not clicked contains.',e))
  });

  if(!clicked){
    const html = await page.waitForXPath("/html").then(html => html.outerHTML).catch(()=>{})
    console.log(html)
  }
  // if (!clicked) {
  //   clicked = true;
  //   await page.waitForXPath(`//*[contains(@id, "-${teamToPlay.summoner}-")]/img`,
  //       {timeout: 3000})
  //   .then(card => {
  //     card.focus();
  //     page.waitForTimeout(500)
  //     console.log("summoner card visable....")
  //     card.click()
  //     .then(() =>console.log(chalk.bold.greenBright(teamToPlay.summoner,
  //         'summoner clicked xpath contaions.')))
  //     .catch(e =>{
  //       clicked = false;
  //       console.log(chalk.bold.redBright('Summoner not clicked contains.',e))
  //     })
  //     console.log(chalk.bold.greenBright(teamToPlay.summoner,
  //         'summoner clicked xpath contaions.'));
  //   })
  //   .catch((e) => {
  //     clicked = false;
  //     console.log(chalk.bold.redBright('Summoner not clicked contains.',e))
  //   });
  // }

  if(!clicked){
    const selector = "div[card_detail_id='" + teamToPlay.summoner
        + "'] > img"
    await page.waitForSelector(selector,{timeout: 5000, visible: true}).then((item) => item.click())
    .then(() =>{
      clicked = true;
      console.log("summoner  card selector clicked........:", selector);
    }).catch((e)=>{
      clicked = false
      console.log("card click selector error......",e)
    })

    // await page.evaluate((selector) => {
    //   clicked = true
    //   console.log("summoner  card selector clicked........:", selector)
    //   return document.querySelector(selector).click()
    // }, selector)
    // .catch((e) =>{
    //   clicked = false
    //   console.log("card click selector error......",e)
    // });
  }

  return clicked
}

async function clickFilterElement(page, teamToPlay, matchDetails) {
  let clicked = true;
  const playTeamColor = teamActualSplinterToPlay(teamToPlay.cards.slice(0, 6))
      || matchDetails.splinters[0]
  await sleep(4000)
  console.log('Dragon play TEAMCOLOR', playTeamColor)
  await page.waitForXPath(`//div[@data-original-title="${playTeamColor}"]`,
      {timeout: 8000})
  .then(selector => {
    selector.click();
    console.log(chalk.bold.greenBright('filter element clicked'))
  })
  .catch(() => {
    clicked = false;
    console.log(chalk.bold.redBright('filter element not clicked'))
  })

  return clicked
}

async function clickMembersCard(page, teamToPlay) {
  let clicked = true;

  for (i = 1; i <= 6; i++) {
    console.log('play: ', teamToPlay.cards[i].toString());
    if (teamToPlay.cards[i]) {
      clicked = await clickWithCheck(page, teamToPlay, i)
      if (!clicked) {
        console.log('break play: ', teamToPlay.cards[i].toString());
      }
    } else {
      console.log('nocard ', i);
    }

  }
  return clicked
}

async function clickWithCheck(page, teamToPlay, i) {
  await  doCardSelect(page,teamToPlay,i)
  if(! await checkCardSelected(page,teamToPlay,i)){
    console.log("2  doCardSelect again.....",teamToPlay.cards[i])
    await  doCardSelectAgain(page,teamToPlay,i)
  }

  await page.waitForTimeout(1000);

  console.log("3  finally  check card selected  .....",teamToPlay.cards[i])
  if(!await checkCardSelected(page,teamToPlay,i)) {
    cardNoClickCnt ++;
    errorCnt ++;
    doSummaryErrorLog({time:new Date().toLocaleString() , account: process.env.ACCOUNT ,errorCnt:errorCnt,reason: "card not clicked " + teamToPlay.cards[i] })
    console.log(
          new Date().toLocaleString() + ":" + process.env.ACCOUNT + ":"
          + errorCnt + ":" + "card not clicked finally" + teamToPlay.cards[i])
  }

  return true;
}

async function checkCardSelected(page,teamToPlay,i) {
  let  selected = true;
  await page.waitForXPath(
      `//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`,
      {timeout: 20000})
  .then(card => card.getProperty('className'))
  .then((cn) => cn.jsonValue())
  .then(className => {
    console.log(className)
    if (className.indexOf("card--selected") == -1) {
      selected = false;
      console.log(teamToPlay.cards[i], ":", "clicked=false")
    } else {
      selected = true;
      console.log(teamToPlay.cards[i], ":", "check selected")
    }
  })
  .catch(() => {
    console.log(chalk.bold.redBright(teamToPlay.cards[i], 'check card selected error'));
  });
  return selected;
}

async function doCardSelect(page,teamToPlay,i) {
  let clicked = true;
  // `//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]/img`
  console.log("1  clickWithCheck ......xpath  contains")
  clicked = await page.waitForXPath(
      `//*[contains(@id, "-${teamToPlay.cards[i].toString()}-")]/img`,
      {timeout: 20000, visible: true})
  .then(card => {
    card.focus();
    page.waitForTimeout(500)
    console.log("1.1 " + chalk.bold.greenBright(teamToPlay.cards[i], 'xpath  focused'));
    return card.click() .then(() =>{
      console.log("1.2 " + chalk.bold.greenBright(teamToPlay.cards[i], 'xpath  contains clicked'));
      return true;
    })
    .catch((e) => {
      clicked = false;
      console.log(chalk.bold.redBright(teamToPlay.cards[i],
          'xpath  contains not clicked',e));
      return false;
    });
  })
  .catch((e) => {
    clicked = false;
    console.log(chalk.bold.redBright(teamToPlay.cards[i],
        'xpath  contains not clicked',e));
    return false;
  });

  page.waitForTimeout(1000)

  if(!clicked) {
    const cardItem = await page.$x(`//*[contains(@id, "-${teamToPlay.cards[i].toString()}-")]/img`)
    .catch((e) => {
      console.log(chalk.bold.redBright(teamToPlay.cards[i],
          'xpath  contains not visiable'),e);
    });
    await  cardItem[0].click().then(() =>{
      console.log("1.3 " + chalk.bold.greenBright(teamToPlay.cards[i], 'xpath  contains clicked'));
    }).catch((e) =>{
      clicked = false;
      console.log(chalk.bold.redBright(teamToPlay.cards[i],
          'xpath  contains not clicked222',e));
    })

    page.waitForTimeout(1000)

    if(!clicked){
      const selector = "div[card_detail_id='" + teamToPlay.cards[i].toString()
          + "'] > img"
      await page.evaluate((selector) => {
        clicked = true
        console.log("1.4  card selector clicked........:", selector)
        return document.querySelector(selector).click()
      }, selector)
      .catch((e) =>{
        console.log("card click selector error......",e)
      });
    }
  }

}

async function doCardSelectAgain(page,teamToPlay,i) {
  const selector = "div[card_detail_id='" + teamToPlay.cards[i].toString()
      + "'] > img"
  await page.evaluate((selector) => {
    console.log("2.1  card selector clicked........:", selector)
    return document.querySelector(selector).click()
  }, selector)
  .catch((e) =>{
    console.log("2.1.1  card click selector error......",e)
  });

  page.waitForTimeout(1000)


  const cardItem = await page.$x(`//*[contains(@id, "-${teamToPlay.cards[i].toString()}-")]/img`)
  .catch((e) => {
    console.log(chalk.bold.redBright(teamToPlay.cards[i],
        'xpath  contains not visiable'),e);
  });
  await  cardItem[0].click().then(() =>{
    console.log("2.2 " + chalk.bold.greenBright(teamToPlay.cards[i], 'xpath  contains clicked'));
  }).catch((e) =>{
    console.log(chalk.bold.redBright(teamToPlay.cards[i],
        '2.2.1  xpath  contains not clicked222',e));
  })
}


async function clickCreateTeamButton(page) {
  let clicked = true;
  console.log('0 clickCreateTeamButton reload start .....',
      new Date().toLocaleTimeString())
  await reload(page);
  await page.waitForNavigation({timeout: 5000}).catch(() =>{});
  let url = await page.url();
  console.log("1. clickCreateTeamButton current url :" ,url)

  await page.click('.btn--create-team').then(() => console.log('clickCreateTeamButton btn--create-team  clicked again..............', new Date().toLocaleTimeString()))
  .then(() => {
    clicked = true
  })
  .catch(() => console.log('clickCreateTeamButton page.click   btn--create-team error'))

  await page.waitForNavigation({timeout: 5000}).catch(() =>{});
  url = await page.url();
  console.log("2. clickCreateTeamButton current url :" ,url)
  if(url != "https://splinterlands.com/?p=create_team2"){
    clicked = false
  }
  return clicked
}

async function clickCards(page, teamToPlay, matchDetails, retriesNum) {
  const maxRetries = 6;
  // let retriesNum = 1;
  let allCardsClicked = false;

  while (!allCardsClicked && retriesNum <= maxRetries) {
    console.log(`Click cards iter-[${retriesNum}]`);
    if (retriesNum > 1 && !await clickCreateTeamButton(page)) {
      retriesNum++;
      continue
    }

    if (!await clickSummonerCard(page, teamToPlay)) {
      retriesNum++;
      continue
    }

    // TODO
    if (card.color(teamToPlay.cards[0]) === 'Gold' && !await clickFilterElement(
        page, teamToPlay, matchDetails)) {
      retriesNum++;
      continue
    }
    await page.waitForTimeout(1000 * 1);

    if (!await clickMembersCard(page, teamToPlay)) {
      retriesNum++;
      continue
    }
    allCardsClicked = true;
  }

  return allCardsClicked
}

async function startBotPlayMatch(page, browser) {

  console.log(new Date().toLocaleString(), 'opening browser...')

  try {
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    await page.setViewport({
      width: 1800,
      height: 1600,
      deviceScaleFactor: 1,
    });
    await page.goto('https://splinterlands.com/').catch(() => {
      console.log("opening browser error ......")
      throw new PageRestartException(`Restart needed.`);
    });
  } catch (e) {
    console.log("page session error")
    try {
      await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
      await page.setViewport({
        width: 1800,
        height: 1600,
        deviceScaleFactor: 1,
      });
      await page.goto('https://splinterlands.com/');
    } catch (e) {
      console.log("page session error")
      throw new PageRestartException(`Restart needed.`);
    }
  }
  try {
    await page.waitForTimeout(3000);

    // let item = await page.waitForSelector('#log_in_button > button', {
    //   visible: true,
    // })
    // .then(res => res)
    // .catch(() => console.log('Already logged in'))

   const loginAccount =  await getElementText(page,"#log_in_text > a > div > div.bio__details > span > span")
    console.log("loginAccount:" + loginAccount)

    if (loginAccount == "") {
      console.log('Login attempt...')
      await splinterlandsPage.login(page, account, password).catch(e => {
        console.log(e);
        runStat = true;
        throw new Error('Login Error');
      });
    } else {
      console.log("already logined --------------------------:" + loginAccount)
    }

    await page.goto('https://splinterlands.com/?p=battle_history')
    .then(() =>console.log("1 goto splinterlands.com/?p=battle_history success.............."))
    .catch(() => {
      console.log("goto  splinterlands.com/?p=battle_history error ........")
      page.goto('https://splinterlands.com/?p=battle_history')
      .then(() =>console.log("1 goto splinterlands.com/?p=battle_history success.............."))
    })
    ;//https://splinterlands.com/
    // await page.waitForTimeout(8000);
    // await page.reload();
    await page.waitForTimeout(8000 * 4);
    await closePopups(page);
    await closePopups(page);

    let RANKED = process.env.RANKED == null ? "W" : process.env.RANKED;
    await setRankedMode(page)
    await uplevelLeage(page)

    const rating = await checkRating(page);
    const power = await checkPower(page);
    const ecr = await checkEcr(page);
    const dec = await checkDec(page)
    const league = await checkLeague(page)
    const seasonRewardCnt = await checkSeasonRewards(page)
    // const nextQuestTime = await  checkNextQuest(page)
    // const deltaDec = preOwnDec > 0 && preOwnDec != dec ? dec - preOwnDec
    //     : preDeltaDec;
    // preOwnDec = dec;
    // preDeltaDec = deltaDec;
    const deltaPower = checkPowerUpgrade(rating,power,RANKED);

    // if (ecr === undefined) throw new Error('Fail to get ECR.')
    console.log('getting user quest info from splinterlands API...')
    // check focus new quest , current focus quest  end
    await focusNewQuest(page);
    // do daily quest claim
    const isClaimDailyQuestMode = process.env.CLAIM_DAILY_QUEST_REWARD
    === 'false' ? false : true;
    const isLeageBRONZE = league ? league.indexOf("BRONZE") != -1 : false;
    console.log("isLeageBRONZE ,", isLeageBRONZE)
    // TODO auto claim daily
    if (isClaimDailyQuestMode === true) {
      await doDailyClaim(page);
    }
    await page.waitForTimeout(5000 * 5);

    // get quest info
    let quest = await getQuest(page);
    if (!quest) {
      console.log(
          'Error for quest details. Splinterlands API didnt work or you used incorrect username, remove @ and dont use email')
      await page.waitForTimeout(5000 * 5);
      quest = await getQuest(page);
      if (!quest) {
        quest = {splinter: 'earth', total: 0, completed: 0, nct: "", fc: 0}
      }
    } else {
      console.log("quest:", quest)
    }
    const nextQuestTime = quest.nct
    //if quest done claim reward. default to true. to deactivate daily quest rewards claim, set CLAIM_DAILY_QUEST_REWARD false in the env file
    console.log('claim daily quest setting:',
        process.env.CLAIM_DAILY_QUEST_REWARD, 'Quest details: ', quest);
    // match rule skip , get new quest
    if (process.env.SKIP_QUEST && quest?.splinter
        && process.env.SKIP_QUEST.split(',').includes(quest?.splinter)) {
      await newQuest(page)
    }

    // const isWaitForBeginWithHighECR = ecr && process.env.ECR_RECOVER_TO && ecr
    //     <= parseFloat(process.env.ECR_RECOVER_TO);
    const isOverECR = ecr && ecr >= 40;
    const isLowEcr = ecr && ecr <= 0 //TODO .....
    const checkRatingAndPower = parseInt(rating) >= 1030;
    let dailyTaskAlmostFinished = isDailyTaskAlmostFinished(quest);

    // console.log("isWaitForBeginWithHighECR:", isWaitForBeginWithHighECR,
    //     "dailyTaskAlmostFinished", dailyTaskAlmostFinished,
    //     "checkRatingAndPower:", checkRatingAndPower, "!isOverECR:", !isOverECR)
    // do sleep
    // await doGuildBrawl(page)
    await  doSleepWait(page,checkRatingAndPower,isLowEcr,isOverECR
        ,nextQuestTime,RANKED,quest,ecr,seasonRewardCnt,power,deltaPower,dec,league,rating)

    console.log('getting user cards collection from splinterlands API...')

    let [myCards,idMap] = await doPlayerCardsInit(RANKED)
    console.log("doPlayerCardsInit:",myCards.length)
    //check if season reward is available
    await doSeasonClaim(page);

    console.info(' The Battle for the battle.....')
    // LAUNCH the battle
    if (!await launchBattle(page)) {
      errorCnt++;
      throw new Error('The Battle cannot start');
    }

    // #666#  开始配置 GET MANA, RULES, SPLINTERS, AND POSSIBLE TEAM
    console.time("battle")
    await page.waitForTimeout(15000);
    let [mana, rules, splinters, enemyRecent] = await Promise.all([
      splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(
          () => 'no mana'),
      splinterlandsPage.checkMatchRules(page).then(
          (rulesArray) => rulesArray).catch(() => 'no rules'),
      splinterlandsPage.checkMatchActiveSplinters(page).then(
          (splinters) => splinters).catch(() => 'no splinters'),
      splinterlandsPage.checkMatchEnemy(page).then(
          (enemyRecent) => enemyRecent).catch(() => 'no enemyRecent')
    ]);

    if (mana == "no mana") {
      console.log("excepiton no mana , do again")
      await page.waitForTimeout(10000);
      [mana, rules, splinters, enemyRecent] = await Promise.all([
        splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(
            () => 'no mana'),
        splinterlandsPage.checkMatchRules(page).then(
            (rulesArray) => rulesArray).catch(() => 'no rules'),
        splinterlandsPage.checkMatchActiveSplinters(page).then(
            (splinters) => splinters).catch(() => 'no splinters'),
        splinterlandsPage.checkMatchEnemy(page).then(
            (enemyRecent) => enemyRecent).catch(() => 'no enemyRecent')
      ]);
    }

    if (mana == "no mana") {
      console.log("still no mana , do return")
      errorCnt++;
      throw new Error('still no mana , do return');
    }

    const matchDetails = {
      orgMana: mana,
      mana: mana,
      rules: rules,
      splinters: splinters,
      myCards: myCards,
      enemyRecent: enemyRecent,
      rating: rating,
      quest: quest.splinter,
      ranked: rating,
      idMap: idMap,
      logContent: {
        account: account,
        isWin: '',
        mana: mana,
        rules: rules,
        splinters: splinters.join("|"),
        type: RANKED
      }
    }
    await page.waitForTimeout(2000 * 2);

    console.timeLog("battle", "2 battle init matchDetails finished")
    let possibleTeams = await ask.possibleTeams(matchDetails, account).catch(
        e => console.log('Error from possible team API call: ', e));
    console.timeLog("battle",
        "3 battle possibleTeams finished : " + possibleTeams.length)
    matchDetails['logContent']['possibleTeams'] = possibleTeams.length

    if (possibleTeams && possibleTeams.length) {
      console.log('1 Possible Teams based on your cards: ',
          possibleTeams.length);
    } else {
      throw new Error('NO TEAMS available to be played');
    }

    //TEAM SELECTION
    const teamToPlay = await ask.teamSelection(possibleTeams, matchDetails,
        quest, page.favouriteDeck);
    console.timeEnd("battle")
    let startFightFail = false;
    if (teamToPlay) {
      await page.$eval('.btn--create-team', elem => elem.click())
      .then(() => console.log('btn--create-team clicked'))
      .catch(async () => {
        console.log('Create team didnt work, waiting 5 sec and retry');
        await page.reload();
        await page.waitForTimeout(5000 * 2);
        await page.$eval('.btn--create-team', elem => elem.click())
        .then(() => console.log('###############7################btn--create-team clicked'))
        .catch(() => {
          startFightFail = true;
          errorCnt++;
          console.log('Create team didnt work. Did the opponent surrender?');
        });
      });
      if (startFightFail) {
        return
      }
    } else {
      errorCnt++;
      throw new Error('Team Selection error: no possible team to play');
    }
    await page.waitForNavigation({timeout: 3000}).catch(() =>{});
    let url = await page.url();
    console.log("1. current url :" ,url)
    await page.click('.btn--create-team').then(() => console.log('btn--create-team clicked again..............', new Date().toLocaleTimeString()))
    .catch(() => console.log('page.click   btn--create-team error'))
    url = await page.url();
    console.log("2. current url :" ,url)
    await page.waitForNavigation({timeout: 5000}).catch(() =>{});
    url = await page.url();
    console.log("3. waitForNavigation current url :" ,url)
    if(url != "https://splinterlands.com/?p=create_team2") {
      await page.waitForNavigation({timeout: 5000}).catch(() =>{});
      url = await page.url();
      console.log("3. waitForNavigation current url :" ,url)
      if(url != "https://splinterlands.com/?p=create_team2" &&
          !await clickCreateTeamButton(page)){
        errorCnt++;
        cardNoClickCnt ++;
        url = await page.url();
        console.log("4. waitForNavigation current url :" ,url)
      }
    }

    // Click cards based on teamToPlay value.
    if (!await clickCards(page, teamToPlay, matchDetails, 1)) {
      errorCnt++;
      return
    }
    let isWin = "F";
    if (await doGreenBtnStart(page)) {
      errorCnt++;
      return;
    }

    let surrenderBtnVisible = false;
    await page.waitForSelector('#btn_surrender', {visible: true, timeout: 5000})
    .then(() => {
      console.log('btn_surrender visible', new Date().toLocaleString());
      surrenderBtnVisible = true;
    })
    .catch(() => {
      console.log('btn_surrender not visible', new Date().toLocaleString());
    })

    // await page.waitForTimeout(5000);
    let isRumbleVisable = true;
    await page.waitForSelector('#btnRumble', {timeout: 30000}).then(
        () => console.log('btnRumble visible',
            new Date().toLocaleString())).catch(() => {
      console.log('btnRumble not visible', new Date().toLocaleString());
      isRumbleVisable = false;
    });
    if (!surrenderBtnVisible && !isRumbleVisable) {
      console.log('**********************isRumbleVisable: false ');
      if (!await clickCards(page, teamToPlay, matchDetails, 2)) {
        loseTotal += 1;
        errorCnt++;
        return;
      }
      if (await doGreenBtnStart(page)) {
        errorCnt++;
        return;
      }
      await page.waitForSelector('#btnRumble', {timeout: 30000}).then(
          () => console.log('btnRumble visible',
              new Date().toLocaleString())).catch(() => {
        console.log('btnRumble not visible', new Date().toLocaleString());
        isRumbleVisable = false;
      });
    }
    await page.$eval('#btnRumble', elem => elem.click()).then(
        () => console.log('btnRumble clicked')).catch(() => {
      console.log('btnRumble didnt click');
      loseTotal += 1;
      errorCnt++;
    }); //start rumble
    await page.waitForSelector('#btnSkip', {timeout: 10000}).then(
        () => console.log('btnSkip visible')).catch(
        () => console.log('btnSkip not visible'));
    await page.$eval('#btnSkip', elem => elem.click()).then(
        () => console.log('btnSkip clicked')).catch(
        () => console.log('btnSkip not visible')); //skip rumble
    await page.waitForTimeout(5000);
    try {
      const upper = await getElementText(page,
          '#dialog_container > div > div > div > div.modal-body > div:nth-child(1) > div > section > div.bio > div.bio__details > div.bio__name > span.bio__name__display', 15000);

      const downer = await getElementText(page,
          '#dialog_container > div > div > div > div.modal-body > div:nth-child(2) > div > section > div.bio > div.bio__details > div.bio__name > span.bio__name__display', 15000);
      // const winFlag = await getElementText(page,
      //     '#dialog_container > div > div > div > div.modal-body > div:nth-child(2) > div > section > h2').trim()

      console.log("result  : " , upper.trim(), ':', downer.trim())
      const downWinFlag = await getElementTextByXpath(page,
          '//*[@id="dialog_container"]/div/div/div/div[2]/div[2]/div/section/h2/text()', 15000);

      console.log("result  downWinFlag: " ,downWinFlag.trim() )
      if (downWinFlag.trim() == "winner"  && downer.trim() == process.env.ACCOUNT  ) {
        isWin = "T";
        const decWon = await getElementText(page,
            '#dialog_container > div > div > div > div.modal-body > div:nth-child(2) > div > section > div.footer > span.sps-reward.footer-text > span', 1000)
        .catch(() => {});
        console.log(chalk.green('You won! Reward: ' + decWon + ' DEC'));
        totalDec += !isNaN(parseFloat(decWon)) ? parseFloat(decWon) : 0;
        winTotal += 1;
        // ---------- check daily claim start TODO
        if (isClaimDailyQuestMode === true) {
          await doDailyClaim(page);
        }

      } else if (downWinFlag.trim() == "loser"  && downer.trim()!= process.env.ACCOUNT  ) {
        isWin = "T";
        const decWon = await getElementText(page,
            '#dialog_container > div > div > div > div.modal-body > div:nth-child(1) > div > section > div.footer > span.sps-reward.footer-text > span', 1000)
        .catch(() => {});
        console.log(chalk.green('You won! Reward: ' + decWon + ' DEC'));
        totalDec += !isNaN(parseFloat(decWon)) ? parseFloat(decWon) : 0;
        winTotal += 1;
        // ---------- check daily claim start TODO
        if (isClaimDailyQuestMode === true) {
          await doDailyClaim(page);
        }
      } else {
        console.log(chalk.red('You lost'));
        loseTotal += 1;
        isWin = "F";
      }
    } catch {
      console.log('Could not find winner - draw?');
      isWin = "D"
      undefinedTotal += 1;
    }
    await clickOnElement(page, '.btn--done', 22000, 12000);
    await clickOnElement(page, '#menu_item_battle', 22000, 12000);

    console.log('Total Battles: ' + (winTotal + loseTotal + undefinedTotal)
        + chalk.green(' - Win Total: ' + winTotal) + chalk.yellow(
            ' - Draw? Total: ' + undefinedTotal) + chalk.red(
            ' - Lost Total: ' + loseTotal), " nextQuestTime:", nextQuestTime);
    console.log(chalk.green('Total Earned: ' + totalDec + ' DEC'));

    const summaryInfo = {
      time: new Date().toLocaleTimeString(),
      NQT: nextQuestTime,
      CT: claimTime,
      user: process.env.ACCOUNT,
      NQ: RANKED,
      ECR: ecr,
      WC: winTotal,
      LC: loseTotal,
      FC: quest.fc
      ,
      WR: (winTotal / (winTotal + loseTotal)).toFixed(2),
      SRC: seasonRewardCnt// totalDec.toFixed(2)
      ,
      quest: quest?.splinter + ":" + teamToPlay.cards[7],
      LW: isWin+":"+matchDetails['logContent']['strategy'],
      qt: quest?.total,
      qc: quest?.completed,
      rating: rating,
      power: power + "(" + deltaPower + ")",
      sps: dec, //totalDec.toFixed(2),
      league: league,
      NC: cardNoClickCnt
    };

    doSummaryLog(summaryInfo)

    if(isWin != "D") {
      winMap[matchDetails['logContent']['strategy']+"-"+isWin] = winMap[matchDetails['logContent']['strategy']+"-"+isWin] + 1
      winMap['cnt'] = loseTotal - winTotal;
      const winSummaryInfo =  Object.assign({"user": process.env.ACCOUNT},winMap)
      winSummaryInfo["alg"] = process.env.algorithm
      doSummaryWinLog(winSummaryInfo);
    }


    matchDetails['logContent']['isWin'] = isWin
    matchDetails['logContent']['rating'] = rating
    runStat = true;
    runFlgCnt = 0;
    await csvWriter.writeRecords([matchDetails['logContent']]).then(
        () => console.log('The CSV file was written successfully'));

  } catch (e) {
    console.log(
        'Error handling browser not opened, internet connection issues, or battle cannot start:',
        e)
    if (runStat == false) {
      runFlgCnt++;
    }
    runStat = false;
    doSummaryErrorLog({time:new Date().toLocaleString() , account: process.env.ACCOUNT ,errorCnt:errorCnt,reason: e.message })
    console.log(
        new Date().toLocaleString() + ":" + process.env.ACCOUNT + ":"
        + errorCnt + ":" + e.message)
  }
}

async function doSleepWait(page,checkRatingAndPower,isLowEcr,isOverECR
    ,nextQuestTime,RANKED,quest,ecr,seasonRewardCnt,power,deltaPower,dec,league,rating) {
  // do sleep .....
  let deltaLost = loseTotal - winTotal
  if (ecr <= 2) {
    // const random = Math.ceil(Math.random() * 1) * 60000

    let oneHour = 1 * 1000 * 60* 60
    let delayMs  = oneHour * 10
    console.log(chalk.bold.white(
        `Time needed to recover ECR, approximately ${ delayMs / oneHour } hours.ecr:`), ecr );
    // logsummsary

    const summaryInfo = {
      time: new Date(
          Date.now() + delayMs ).toLocaleTimeString(),
      NQT: nextQuestTime,
      CT: claimTime,
      user: process.env.ACCOUNT,
      NQ: RANKED,
      ECR: ecr,
      WC: winTotal,
      LC: loseTotal,
      FC: quest.fc
      ,
      WR: (winTotal / (winTotal + loseTotal)).toFixed(2),
      SRC: seasonRewardCnt  //totalDec.toFixed(2)
      ,
      quest: quest != null ? quest?.splinter : "-",
      LW: "-",
      qt: quest != null ? quest?.total : "-",
      qc: quest != null ? quest?.completed : "-",
      rating: rating,
      power: power + "(" + deltaPower + ")",
      sps: dec,
      league: league,
      NC: cardNoClickCnt
    };
    try {
      doSummaryLog(summaryInfo)
      await doGuildBrawl(page)
    }
    catch (e){
      console.log(e)
    }
    console.log(chalk.bold.white(
        `Initiating sleep mode. The bot will awaken at ${new Date(
            Date.now() + delayMs ).toLocaleString()}`));

    await sleep(delayMs);
    runStat = true;
    throw new Error(`Restart needed.`);
  }
}
async function doPlayerCardsInit(RANKED) {
  const [myCards , idMaps] =  await user.getPlayerCardsV2(account.toLowerCase())
  return [myCards , idMaps] ;
}

function checkPowerUpgrade(rating ,power,ranked){
    if(rating >= 3400 ){
      let targetPower = 200000 ;
      let targetNextPower = 300000;
      if(ranked == 'W') {
        targetPower = targetPower * 2;
        targetNextPower = targetNextPower * 2;
      }
       return getPowerMarker(power,targetPower,targetNextPower)
    }

  if(rating >= 3100 ){
    let targetPower = 162500 ;
    let targetNextPower = 200000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 2800 ){
    let targetPower = 125000 ;
    let targetNextPower = 162500;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 2500 ){
    let targetPower = 100000 ;
    let targetNextPower = 125000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 2200 ){
    let targetPower = 75000 ;
    let targetNextPower = 100000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 1900 ){
    let targetPower = 50000 ;
    let targetNextPower = 75000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 1600 ){
    let targetPower = 35000 ;
    let targetNextPower = 50000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 1300 ){
    let targetPower = 20000 ;
    let targetNextPower = 35000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 1000 ){
    let targetPower = 7500 ;
    let targetNextPower = 20000;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 700 ){
    let targetPower = 2500 ;
    let targetNextPower = 7500;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  if(rating >= 400 ){
    let targetPower = 500 ;
    let targetNextPower = 2500;
    if(ranked == 'W') {
      targetPower = targetPower * 2;
      targetNextPower = targetNextPower * 2;
    }
    return getPowerMarker(power,targetPower,targetNextPower)
  }

  return "-" ;

}

function getPowerMarker (current,targetPower , nextTargetPower){
  const delterTarget = targetPower/1000 - current/1000
  const delterNextTarget = nextTargetPower/1000 - current/1000
  if(delterTarget > 0 ){
    return -delterTarget.toFixed(1) + "k↓";
  } else {
    if(delterNextTarget >0 ){
      return -delterTarget.toFixed(1) + "k-";
    } else {
      return -delterNextTarget.toFixed(1) + "k↑";
    }
  }
}

async function doGreenBtnStart(page) {
  let startFightFail = false;
  await page.waitForSelector('.btn-green', {timeout: 3000}).then(
      () => console.log('btn-green visible')).catch(
      () => console.log('btn-green not visible'));
  const leftTime = await getElementText(page,
      "#create-team-timer > div > div.countdown-time > div.countdown-time-container")
  console.log("----------------leftTime--------",
      new Date().toLocaleString(), leftTime)
  await page.$eval('.btn-green', elem => elem.click())
  .then(() => console.log('1 btn-green clicked', new Date().toLocaleString()))
  .catch(async (e) => {
    console.log('Start Fight didnt work, waiting 5 sec and retry',e);
    await page.waitForTimeout(3000);
    await page.$eval('.btn-green', elem => elem.click())
    .then(() => {
      console.log('2 btn-green clicked');
    })
    .catch((e) => {
      startFightFail = true;
      console.log('Start Fight didnt work. Did the opponent surrender?',e);
    });
  });
  if (startFightFail) {
    return true;
  }

  await page.waitForTimeout(1000);

  return false;
}

async function focusNewQuest(page) {
  try {
    await page.waitForXPath('//*[@id="focus_new_btn"]',
        {timeout: 5000, visible: true})
    .then(fbtn => fbtn.click())
    .then(() => console.log('1  focus_new_btn New quest clicked ', new Date()))
    .then(() => page.waitForTimeout(30000))
    .then(async () => {
      await page.reload();
      console.log('1.1  focus_new_btn New quest page reload', new Date())
    })
    .then(() => page.waitForTimeout(30000))
    .then(() => console.log('1.2  focus_new_btn New quest reload wait end  ',
        new Date()))
    .then(() => {
      resetDailyStat();
    })
    .catch(e => console.log('2. Cannot click on focus_new_btn'))
  } catch (e) {
    console.log('2. Error while start new quest')
  }
}

function resetDailyStat() {
  winTotal = 0;
  undefinedTotal = 1;
  loseTotal = 0;
  totalDec = 0;
  errorCnt = 0;
}

async function doDailyClaim(page) {
  try {
    await page.waitForSelector('#quest_claim_btn', {timeout: 5000 * 2})
    .then(button => button.click()).then(() => {
      dailyClaim = true;
      resetDailyStat();
      const tm = new Date().toLocaleString('en-GB').split(",")
      claimTime = tm[0].split("/")[0] + tm[1].slice(0, 6)
      page.waitForTimeout(60000);
    });
  } catch (e) {
    dailyClaim = false;
    console.info('no quest reward to be claimed waiting for the battle...')
  }
}

async function doSeasonClaim(page){
  if (process.env.CLAIM_SEASON_REWARD === 'true') {
    try {
      console.log('Season reward check: ');
      await page.waitForSelector('#claim-btn',
          {visible: true, timeout: 10000})
      .then(async (button) => {
        button.click();
        console.log(
            `claiming the season reward. you can check them here https://peakmonsters.com/@${account}/explorer`);
        await page.waitForTimeout(20000 * 2);
        await page.reload();

      })
      .catch(() => console.log(
          `no season reward to be claimed, but you can still check your data here https://peakmonsters.com/@${account}/explorer`));
      await page.waitForTimeout(3000 * 3);
      await page.reload();
    } catch (e) {
      console.info('no season reward to be claimed')
    }
  }
}

async function newQuest(page) {
  try {
    await page.click('#quest_new_btn')
    .then(() => page.waitForTimeout(20000))
    .then(async a => {
      await page.reload();
      console.log('New quest requested');
    })
    .then(() => page.waitForTimeout(30000))
    .catch(e => console.log('Cannot click on new quest'))

  } catch (e) {
    console.log('Error while skipping new quest')
  }
}

function isDailyTaskAlmostFinished(quest) {
  if (quest == null) {
    return false;
  }

  if (quest.nct == null || quest.nct.trim().length == 0) {
    return false;
  }

  let remainHours = parseInt(quest.nct.split(":")[0])

  if (remainHours <= 2 &&
      quest.completed / quest.total >= 0.6) {
    console.log("*****isDailyTaskAlmostFinished*******: ", quest.completed,
        quest.total);
    return true;
  }

  return false;
}

function doSummaryLog(summaryInfo) {
  delete require.cache[require.resolve("./data/log/stat.json")]
  let statJson = require('./data/log/stat')
  statJson[process.env.ACCOUNT] = summaryInfo
  fs.writeFile(`./data/log/stat.json`, JSON.stringify(statJson),
      function (err) {
        if (err) {
          console.log(err);
        }
      });

  let summaryArray = []
  const totalSum ={"user":"total","WC":0,"LC":0}
  statJson['users'].forEach(user => {
    if (statJson[user]) {
      totalSum['WC'] = statJson[user]['WC'] + totalSum['WC']
      totalSum['LC'] = statJson[user]['LC'] + totalSum['LC']
      summaryArray.push(statJson[user])
    }
  })

  totalSum['WR'] = (totalSum['WC']/(totalSum['WC'] + totalSum['LC'])).toFixed(2)
  summaryArray.push(totalSum)
  summaryLogger.table(summaryArray)
}

function doSummaryErrorLog(summaryInfo) {
  delete require.cache[require.resolve("./data/log/errorStat.json")]
  let statJson = {"users":["xqm123","xqm1234","hkd123","hkd1234","xifei123","xifei1234","sugelafei2","sugelafei","xgq123","xgq1234"]}
  try{
    let statJsonLoad =  require('./data/log/errorStat')
    if(statJsonLoad != null) {
      statJson = statJsonLoad;
    }
  } catch (e) {

  }

  const reasonSize= summaryInfo.reason.length
  summaryInfo.reason = summaryInfo.reason.slice(0,reasonSize >= 21 ? 20 : reasonSize)
  statJson[process.env.ACCOUNT] = summaryInfo
  const statJsonStr = JSON.stringify(statJson)
  if(statJsonStr ==null || statJsonStr.trim() == "" ) {
    return;
  }
  fs.writeFile(`./data/log/errorStat.json`, statJsonStr,
      function (err) {
        if (err) {
          console.log(err);
        }
      });

  let summaryArray = []
  statJson['users'].forEach(user => {
    if (statJson[user]) {
      summaryArray.push(statJson[user])
    }
  })
  summaryErrorLogger.table(summaryArray)
}


function doSummaryWinLog(summaryInfo) {
  delete require.cache[require.resolve("./data/log/winStat.json")]
  let statJson = require('./data/log/winStat')
  statJson[process.env.ACCOUNT] = summaryInfo
  fs.writeFile(`./data/log/winStat.json`, JSON.stringify(statJson),
      function (err) {
        if (err) {
          console.log(err);
        }
      });

  let summaryArray = []
  let totalSum =Object.assign({"user": "total"},{"ml-T":0 , "ml-F":0 , "mts-T": 0 , "mts-F":0 , "sm-T":0 ,"sm-F":0 ,"cs-T": 0 , "cs-F":0})
  totalSum["alg"] = ""

  statJson['users'].forEach(user => {
    if (statJson[user]) {
      totalSum['ml-T'] = statJson[user]['ml-T'] + totalSum['ml-T']
      totalSum['ml-F'] = statJson[user]['ml-F'] + totalSum['ml-F']
      totalSum['mts-T'] = statJson[user]['mts-T'] + totalSum['mts-T']
      totalSum['mts-F'] = statJson[user]['mts-F'] + totalSum['mts-F']
      totalSum['sm-T'] = statJson[user]['sm-T'] + totalSum['sm-T']
      totalSum['sm-F'] = statJson[user]['sm-F'] + totalSum['sm-F']
      totalSum['cs-T'] = statJson[user]['cs-T'] + totalSum['cs-T']
      totalSum['cs-F'] = statJson[user]['cs-F'] + totalSum['cs-F']
      summaryArray.push(statJson[user])
    }
  })
  const totalWinCnt =  totalSum['ml-T'] + totalSum['mts-T'] + totalSum['sm-T'] + totalSum['cs-T']
  const totalLostCnt =  totalSum['ml-F'] + totalSum['mts-F'] + totalSum['sm-F'] + totalSum['cs-F']
  totalSum["alg"] = totalWinCnt +":" + totalLostCnt +" ," + (totalWinCnt/(totalWinCnt + totalLostCnt)).toFixed(2)
  summaryArray.push(totalSum)
  summaryWinLogger.table(summaryArray)
}

// 30 MINUTES INTERVAL BETWEEN EACH MATCH (if not specified in the .env file)
const isHeadlessMode = process.env.HEADLESS === 'false' ? false : true;
console.log("isHeadlessMode:", isHeadlessMode)
const executablePath = process.env.CHROME_EXEC || null;
const config = require('./config/config');

let puppeteer_options = {
  browserWSEndpoint: process.env.wsport,
  headless: isHeadlessMode, // default is true
  args: ['--no-sandbox',
    // '--proxy-server=192.168.99.1:1081',
    '--disable-setuid-sandbox',
    // '--proxy-server=127.0.0.1:1080',
    //'--disable-dev-shm-usage',
    //'--disable-accelerated-2d-canvas',
    // '--disable-canvas-aa',
    // '--disable-2d-canvas-clip-aa',
    //'--disable-gl-drawing-for-tests',
    // '--no-first-run',
    // '--no-zygote',
    '--disable-dev-shm-usage',
    // '--use-gl=swiftshader',
    // '--single-process', // <- this one doesn't works in Windows
    // '--disable-gpu',
    // '--enable-webgl',
    // '--hide-scrollbars',
    '--mute-audio',
    // '--disable-infobars',
    // '--disable-breakpad',
    '--disable-web-security']
}
if (executablePath) {
  puppeteer_options['executablePath'] = executablePath;
}

function LostTooMatchException(message) {
  this.message = message;
}

function PageRestartException(message) {
  this.message = message;
}

// #1#   入口程序
async function run() {
  let start = true
  console.log('START ', account, new Date().toLocaleString())
  // const browser = await puppeteer.launch(puppeteer_options);
  const browser = await puppeteer.connect(puppeteer_options);
  //const page = await browser.newPage();
  let [page] = await browser.pages();

  await page.setDefaultNavigationTimeout(500000);
  await page.on('dialog', async dialog => {
    await dialog.accept();
  });
  await page.on('error', function (err) {
    const errorMessage = err.toString();
    console.log('browser error: ', errorMessage)
  });
  await page.on('pageerror', function (err) {
    const errorMessage = err.toString();
    console.log('browser page error: ', errorMessage)
  });
  page.goto('https://splinterlands.io/');
  page.recoverStatus = 0;
  page.favouriteDeck = process.env.FAVOURITE_DECK || '';
  let needRestart = false;
  while (start) {
    console.log('Recover Status: ', page.recoverStatus)
    config.doConfigInit(process.env.ACCOUNT)
    if (runFlgCnt >= 3) {
      console.log("too many error")
      console.log(
          new Date().toLocaleString() + ":" + process.env.ACCOUNT + ":"
          + errorCnt + ":" + "TOO MANY ERRORS!!!!")
      doSummaryErrorLog({time:new Date().toLocaleString() , account: process.env.ACCOUNT ,errorCnt:errorCnt,reason: "TOO MANY ERRORS!!!!" })
      throw new LostTooMatchException("win : " + winTotal,
          " lost :" + loseTotal)
    }

    if ((winTotal + loseTotal + undefinedTotal) >= parseInt(
        process.env.max_cnt)) {
      console.log('process.env.max_cnt matched stop: ', process.env.max_cnt)
      console.log(
          new Date().toLocaleString() + ":" + process.env.ACCOUNT + ":"
          + errorCnt + ":" + "process.env.max_cnt matched stop")
      doSummaryErrorLog({time:new Date().toLocaleString() , account: process.env.ACCOUNT ,errorCnt:errorCnt,reason: "RUN MAX CNT" })
      throw new LostTooMatchException(
          "process.env.max_cnt matched stop : " + process.env.max_cnt)
    }

    await startBotPlayMatch(page, browser)
    .then(async () => {
      console.log('Closing battle', new Date().toLocaleString());
      await page.waitForTimeout(5000);
      const sleepingTimeInMinutes = process.env.MINUTES_BATTLES_INTERVAL;
      const sleepingTime = sleepingTimeInMinutes * 60000;
      console.log(account, 'waiting for the next battle in',
          sleepingTime / 1000 / 60, 'minutes at',
          new Date(Date.now() + sleepingTime).toLocaleString());
      await sleep(sleepingTime);
    })
    .catch((e) => {
      console.log(e);
      start = false;
      if (e instanceof PageRestartException) {
        needRestart = true;
        console.log("1 PageRestartException .........")
      } else {
        console.log(
            new Date().toLocaleString() + ":" + process.env.ACCOUNT + ":"
            + errorCnt + ":" + e.message)
        doSummaryErrorLog({time:new Date().toLocaleString() , account: process.env.ACCOUNT ,errorCnt:errorCnt,reason: "Process Error!!!" })
      }
    })
  }
  if (needRestart) {
    console.log("2.1 page close .........")
    browser.pages().then((pages) => {
      pages.map((page) => page.close().then("needRestart page closed")
      .catch(() => {
        console.log("needRestart pages close error")
      }))
    });

    await sleep(10000);
    console.log("2.2 browser close .........")
    if (await browser.isConnected()) {
      browser.close().then(
          () => console.log("needRestart browser closed....")).catch(() => {
        console.log("needRestart browser close error")
      })
    }

    await sleep(20000);

    console.log("2.2 browser process kill .........")
    if (browser && browser.process() != null) {
      browser.process().kill('SIGINT');
    }

    console.log("3 page restarting .........")
    await run();
  }
}

function setupAccount(uname, pword) {
  account = uname;
  password = pword;
}

async function doGuildBrawl(page){

  //  1. 切换 guild brawl页面
  if(!process.env.guildId || process.env.guildId == null || process.env.guildId == "" ){
     console.log("0、no guild brawl ..........")
     return
  }
  const guildId = process.env.guildId;
  const guildPathUrl = 'https://splinterlands.com/?p=guild&id='+guildId+'&tab=brawl';
  console.log("1、guild brawl start..........")
  try{
    await page.goto(guildPathUrl)
    .then(() =>console.log("1 goto:",guildPathUrl," success!!!"))
    .catch(() => {
      console.log("1.1 goto:",guildPathUrl," error ........")
      page.goto(guildPathUrl)
      .then(() =>console.log("1.1 goto:",guildPathUrl," success!!!"))
    })
    await page.waitForTimeout(10000)
    console.log("2、check PREP STAGE..........")
    const prestageBrawlTime = await getElementText(page,"#brawl_countdown")
    let result = ""
    if(prestageBrawlTime){
      let targetLayer = -1
      if(process.env.guildLayer){
        targetLayer = parseInt(process.env.guildLayer)
      }
      console.log("2.1 COMBAT STARTS IN..........",prestageBrawlTime , " layer : " , targetLayer)
      //#tournament_info > div.brawl-body.details.container > div > div.brawl-body-left.col-md-6 > div > div.chat-container
      result = await page.$$eval("#tournament_info > div.brawl-body.details.container > div > div.brawl-body-left.col-md-6 > div > div.chat-container > div",
          (div,targetLayer,account) => {
            if(div.length < targetLayer) {
              return "no guild"
            }
            let u = null;
            if(targetLayer != -1) {
              u = div[targetLayer -1];
              const entryButton = u.getElementsByClassName("new-button")
              if(entryButton && entryButton.length>=1) {
                entryButton[0].click()
                return "targetLayer"
              }
            }

            for (let i = 0; i < div.length; i++) {
              u = div[i];
              const enterName =  u.getElementsByClassName("bio__name__display")
              if(enterName && enterName.length>= 1) {
                if(enterName[0].textContent.trim().toLowerCase() == account){
                  return "selected";
                }
              }
              // 'Novice League level caps.'
              //  Bronze League level caps.
              // Silver League level caps.
              //All Cards Playable may be used
              //Gold Cards Only may be used.
              const ruleImg = u.getElementsByClassName("rule-img")
              // Alpha Edition may be used.
              // Beta Edition may be used.
              // Only Chaos Legion Edition may be used.
              if(ruleImg && ruleImg.length == 2) {
                console.log("2.2  rule league:",ruleImg[0].getAttribute('data-original-title') , " rule card : " , ruleImg[1].getAttribute('data-original-title'))
              }
              const edition = u.getElementsByClassName("edition-img-single")
              if(edition && edition.length>=1){
                if(edition[0].getAttribute('data-original-title').startsWith("Alpha")){
                  continue
                }
                if(edition[0].getAttribute('data-original-title').startsWith("Only Chaos Legion")){
                  continue
                }
                console.log("2.3  edition:",edition[0].getAttribute('data-original-title') )
              }
              const entryButton = u.getElementsByClassName("new-button")
              if(entryButton && entryButton.length>=1) {
                console.log("2.4  entryButton: visable")
                entryButton[0].click()
                break
              } else {
                console.log("2.5  entry exists........")
              }
            }
            return "new enter "
          },targetLayer , process.env.ACCOUNT.trim().toLowerCase())
      console.log("2.6  check prestage finished........")
    } else {
      console.log("3  entryButton: visable")
    }

    //  检查比赛
    // 1 检查类型
    await page.waitForTimeout(10000)

    const isGoldDiv =  await page.$$eval("#my_brawl_fray_info > div > img:nth-child(6)",
        options=> {
          return options.map(option => option.getAttribute('data-original-title'));
       })
    console.log("isGoldDiv",isGoldDiv)
    let isGold = false;
    try {
      console.log("isGoldDiv[0]:",isGoldDiv[0])
      if(isGoldDiv&&isGoldDiv.length>0 && isGoldDiv[0].startsWith("Gold Cards")){
        isGold = true;
      }
    } catch (e) {
      console.log(e)
    }


    const isChaosOnlyDiv =  await page.$$eval("#my_brawl_fray_info > div > div.edition-container > img",
        options=> {
          return options.map(option => option.getAttribute('data-original-title'));
        })
    let isChaosOnly = false;
    console.log("isChaosOnlyDiv：",isChaosOnlyDiv)
    try {
      console.log("isChaosOnlyDiv：",isChaosOnlyDiv[0])
      if(isChaosOnlyDiv && isChaosOnlyDiv.length > 0 && isChaosOnlyDiv[0].startsWith("Only Chaos Legion")){
        isChaosOnly =   true;
      }
    }catch (e) {
      console.log(e)
    }


    console.log("4.0  enterTeam type isGold ,", isGold, " isChaosOnly :" , isChaosOnly)

   // 2 .检查比赛
    const teamResult = await page.$$eval("#brawl_my_battles_list",
        (div,account) => {
          for (let i = 0; i < div.length; i++) {
            const u = div[i];
            const entryButton = u.getElementsByClassName("new-button")
            if(entryButton && entryButton.length>=1) {
              entryButton[0].click()
              return "enterTeam"
            }
          }
          return "teamFinished"
        },process.env.ACCOUNT.trim().toLowerCase())



    console.log("4  enterTeam: ",teamResult)
    if("enterTeam" == teamResult) {
      await page.waitForTimeout(10000)
      // 检查类型
      console.log("4.1  enterTeam: visable")
      let [myCards ,idMap] = await user.getPlayerCardsOnlyOwnerV2(account.toLowerCase(),isGold)

      if(myCards.length == 0) {
          [myCards ,idMap] = await user.getPlayerCardsOnlyOwnerV2(account.toLowerCase(),isGold)
      }


      myCards = Array.from(new Set(myCards))

      if(isChaosOnly){
        console.log("4.1  enterTeam isChaosOnly ,",myCards.length)
        myCards = cardsDetail.doChaosFilter(myCards)
        console.log("4.1  enterTeam isChaosOnly doChaosFilter ,",myCards.length)
      }

      console.log("4.2   enterTeam: getPlayerCardsOnlyOwner : myCards : ", myCards.length)

      // // TEST
      // try {
      //   const element = await page.waitForSelector("#brawl_enemy_found_page_body", {timeout: 15000 });
      //   const text = await element.evaluate(el => el.outerHTML);
      //   console.log(text)
      // } catch (e) {
      //   const rs = await page.evaluate(() => {
      //     let items = document.querySelector("#brawl_enemy_found_page_body");
      //     return items.outerHTML;
      //   })
      //   console.log(rs)
      // }
      // // TEST

      let [mana, rules, splinters] = await Promise.all([
        splinterlandsPage.checkMatchManaBrawl(page).then((mana) => mana).catch(
            () => 17),
        splinterlandsPage.checkMatchRulesBrawl(page).then(
            (rulesArray) => rulesArray).catch(() => 'Standard'),
        splinterlandsPage.checkMatchActiveSplintersBrawl(page).then(
            (splinters) => splinters).catch(() => [ 'fire', 'water', 'earth', 'life', 'death', 'dragon' ])
      ]);
      if(rules == null || rules == "" ){
        rules = "Standard"
      }

      if(splinters == null || splinters ==[] || splinters =="") {
        splinters = [ 'fire', 'water', 'earth', 'life', 'death', 'dragon' ]
      }

      console.log("4.3   mana:", mana , " rules: ",rules,"  splinters: ",splinters  )

      const matchDetails = {
        orgMana: mana,
        mana: mana,
        rules: rules,
        splinters: splinters,
        myCards: myCards,
        enemyRecent: [],
        enemyPossbileTeams:[],
        rating: 1500,
        ranked: 3500,
        quest:"earth",
        idMap:idMap,
        logContent: {
          account: account,
          isWin: '',
          mana: mana,
          rules: rules,
          splinters: splinters.join("|"),
          type: 'M'
        }
      }
      await page.waitForTimeout(2000 * 2);


      let possibleTeams = await ask.possibleTeams(matchDetails, account).catch(
          e => console.log('Error from possible team API call: ', e));
      console.log("possibleTeams .....:",possibleTeams.length)
      if (possibleTeams && possibleTeams.length) {
        console.log('1 Possible Teams based on your cards: ',
            possibleTeams.length);
      } else {
        throw new Error('NO TEAMS available to be played');
      }

      //TEAM SELECTION
      const result = await ask.teamSelectionForWeb(possibleTeams, matchDetails);
      // const teamToPlay = await ask.teamSelection(possibleTeams, matchDetails,
      //     quest, page.favouriteDeck);

      let startFightFail = false;
      const mlTeam1 = result.mostEnemyAgainstTeam
      const bcTeam2 = result.mostBcTeam
      const winTeam3 = result.mostWinTeam
      const summonerMapTeams = result.summoners
      if (result) {
        await page.$eval('#create-team-btn', elem => elem.click())
        .then(() => console.log('create-team-btn clicked'))
        .catch(async () => {
          console.log('Create team didnt work, waiting 5 sec and retry');
          await page.reload();
          await page.waitForTimeout(5000 * 2);
          await page.$eval('#create-team-btn', elem => elem.click())
          .then(() => console.log('###############7################btn--create-team clicked'))
          .catch(() => {
            startFightFail = true;
            errorCnt++;
            console.log('Create team didnt work. Did the opponent surrender?');
          });
        });
        if (startFightFail) {
          return
        }
      } else {
        errorCnt++;
        throw new Error('Team Selection error: no possible team to play');
      }

      await page.waitForTimeout(5000);
      // TODO check TEAM
      // {summoner: res[0], cards: res[1]}
      let teamToPlay = mlTeam1 == null ? bcTeam2 : mlTeam1
      teamToPlay = teamToPlay == null ?  winTeam3 : teamToPlay
      //
      const enableSummonerArray = await page.$$eval("#page_container > div > div > div.deck-builder-page2__cards > div",
          (div) => {
            let enableList= []
            for (let i = 0; i < div.length; i++) {
              const u = div[i];
              const cardId = u.getAttribute("card_detail_id")

              enableList.push(cardId)
            }
            return enableList
          })

      console.log("enableSummonerArray .....:",enableSummonerArray.length)
      if(enableSummonerArray.indexOf(teamToPlay[0]) == -1) {
        console.log("enableSummonerArray .....teamToPlay not exist:",teamToPlay[0])
        for (let i = 0; i < enableSummonerArray.length; i++) {
          if(summonerMapTeams[enableSummonerArray[i]] != null) {
            teamToPlay = summonerMapTeams[enableSummonerArray[i]];
            break;
          }
        }
      }
      const teamToPlayClick = {summoner: teamToPlay[0], cards: teamToPlay}
      console.log("teamToPlayClick .....:",teamToPlayClick)
      // Click cards based on teamToPlay value.
      if (!await clickCards(page, teamToPlayClick, matchDetails, 1)) {
        errorCnt++;
        return
      }

      if (await doGreenBtnStart(page)) {
        errorCnt++;
        return;
      }
    }
    console.log("9、guild brawl leave..........:",result)
  } catch (e) {
    console.log("99、doGuildBrawl exception ..........",e)
  }
}

exports.run = run;
exports.setupAccount = setupAccount;
module.exports.LostTooMatchException = LostTooMatchException
