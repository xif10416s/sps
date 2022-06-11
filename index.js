//'use strict';
const puppeteer = require('puppeteer');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./userV2');
const card = require('./cards');
const { clickOnElement, getElementText, getElementTextByXpath, teamActualSplinterToPlay, sleep, reload } = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const chalk = require('chalk');
const fs = require('fs');

let isMultiAccountMode = false;
let account = '';
let password = '';
let totalDec = 0;
let winTotal = 0;
let loseTotal = 0;
let undefinedTotal = 0;
let getNewDailyClaim = false;
let dailyClaim = false;
let claimTime = "-"
let runFlgCnt = 0;
let runStat = false;
let preOwnDec = 0;
let preDeltaDec = 0 ;
let preOwnPower = 0 ;
let preDeltaPower = 0;

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let  statFile = './logs/stat.csv';
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
    {id: 'rating',title:'rating'},
    {id: 'tm', title: 'tm'},
]
let  csvWriter  = createCsvWriter({
    path: statFile,
    header:statHeader,
    append : true
});



// LOAD MY CARDS
// async function getCards() {
//     let myCards = []
//     await user.getPlayerCards(account).then(x => myCards.push(x))
//     return myCards;
// }
function getDateFmt(date){
    var nowMonth = date.getMonth() + 1;
    var strDate = date.getDate();
    var seperator = "-";
    if (nowMonth >= 1 && nowMonth <= 9) {
        nowMonth = "0" + nowMonth;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    return date.getFullYear() + seperator + nowMonth + seperator + strDate;
}


const summaryFile = fs.createWriteStream('./logs/Summary.txt', {'flags': 'a'});
const summaryErrorFile = fs.createWriteStream('./logs/SummaryError.txt', {'flags': 'a'});
let summaryLogger = new console.Console(summaryFile, summaryErrorFile);

// async function getQuest() {
//     return quests.getPlayerQuest(account.toLowerCase())
//         .then(x=>x)
//         .catch(e=>console.log('No quest data, splinterlands API didnt respond, or you are wrongly using the email and password instead of username and posting key'))
// }

async function getQuest(page) {
    try {
        const splinter = await getElementText(page, "#quest_title1");
        const total = await getElementText(page,"#quest_chest_total_text")
        const completed = await getElementText(page,"#quest_chest_progress_text")
        const nct = await getElementText(page,"#complete_text")
        const fc = await getElementText(page,"#quest_chests_earned")

        return {splinter: splinter.split(":")[1].trim().toLowerCase() ,total : parseInt(total.replaceAll(",","")) , completed: parseInt(completed.replaceAll(",","")) , nct:nct.replaceAll(" ","") , fc : parseInt(fc)}
    } catch (e) {
        console.log(e)
    }
    return null;
}

async function closePopups(page) {
    console.log('check if any modal needs to be closed...')
	if (await clickOnElement(page, '.close', 4000) ) return;
	await clickOnElement(page, '.modal-close-new', 1000, 2000);
    await clickOnElement(page, '.modal-close', 4000, 2000);
}

async function checkLeague(page) {
    try {
        const league = await getElementText(page, "#current_league_text");
        if(league) {
            console.log(chalk.bold.whiteBright.bgMagenta('Your current league is ' + league));
            // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
            return league
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('league not defined'));
    }
}

//
async function checkEcr(page) {
    try {
        const ecr = await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 3000);
        if(ecr) {
            console.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
            // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
            return parseFloat(ecr)
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('ECR not defined'));
    }
}

async function checkDec(page) {
    try {
        const dec = await getElementText(page, "#bs-example-navbar-collapse-1 > ul.nav.navbar-nav.navbar-right > li:nth-child(2) > div.dec-container > div.balance", 3000);
        if(dec) {
            console.log(chalk.bold.whiteBright.bgMagenta('Your current Dec ' + dec));
            // ask.logger.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
            return parseInt(dec.replaceAll(",",""))
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('dec not defined'));
    }
}

async function checkNextQuest(page) {
    try {
        let nextQuest = await getElementTextByXpath(page, '//*[@id="complete_text"]', 3000);
        if(nextQuest) {
            nextQuest = nextQuest.toString().replace("Next quest available in: ","")
            console.log(chalk.bold.whiteBright.bgMagenta('Your next Quest time is : ' + nextQuest ));
            return nextQuest.toString().trim()
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('next Quest time not defined'));
    }
}

async function checkRating(page) {

    try {
        let rating = await getElementTextByXpath(page, '//*[@id="about_player__status"]/div[1]/div[2]/div/div/div[2]/div[1]/div[1]/span[2]', 3000);
        if(rating) {
            rating = rating.replaceAll(",","").replaceAll("(","").replaceAll(")","")
            console.log(chalk.bold.whiteBright.bgMagenta('Your current Rate is ' + rating));
            return parseFloat(rating)
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('rating not defined'));
    }
}


async function checkPower(page) {

    try {
        const power = await getElementTextByXpath(page, '//*[@id="power_progress"]/div[1]/span[2]', 3000);
        if(power) {
            console.log(chalk.bold.whiteBright.bgMagenta('Your current power is ' + power));
            return parseInt(power.replace(",",""))
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('power not defined'));
    }
}

async function uplevelLeage(page) {
    try {
        await page.click('#adv_btn_container > button')
        .then(() => page.waitForTimeout(1000))
        .then(() =>{
             page.keyboard.press('Enter');
        })
        .then(() => page.waitForTimeout(5000))
        .then(async a=>{
            await page.reload();
            console.log('uplevelLeage  requested')})
        .catch(e=>console.log('Cannot click on up level leage'))
    } catch(e) {
        console.log('Error while click on up level leage')
    }
}

async function findSeekingEnemyModal(page, visibleTimeout=15000) {
    let findOpponentDialogStatus = 0;
    /*  findOpponentDialogStatus value list
        0: modal #find_opponent_dialog has not appeared
        1: modal #find_opponent_dialog has appeared and not closed
        2: modal #find_opponent_dialog has appeared and closed
    */

    console.log('check #find_opponent_dialog modal visibility');
    findOpponentDialogStatus = await page.waitForSelector('#find_opponent_dialog', { timeout: visibleTimeout, visible: true })
        .then(()=> { console.log('find_opponent_dialog visible'); return 1; })
        .catch((e)=> { console.log(e.message); return 0; });

    if (findOpponentDialogStatus === 1) {
        console.log('waiting for an opponent...');
        findOpponentDialogStatus = await page.waitForSelector('#find_opponent_dialog', { timeout: 50000, hidden: true })
            .then(()=> { console.log('find_opponent_dialog has closed'); return 2; })
            .catch((e)=> { console.log(e.message); return 1; });
    }

    return findOpponentDialogStatus
}

async function findCreateTeamButton(page, findOpponentDialogStatus=0, btnCreateTeamTimeout=10000) {
    console.log(`findCreateTeamButton waiting for create team button: `,findOpponentDialogStatus);
    //#enemy_found_ranked > div > div > div.modal-body > div > div:nth-child(2) > button
    //#enemy_found_ranked > div > div > div.modal-body > div > div:nth-child(2) > button
    const createTeamSelecotr= '//*[@id="enemy_found_ranked"]/div/div/div[2]/div/div[2]/button'
    // let startFlag =  await page.waitForXPath('//*[@id="dialog_container"]/div/div/div/div[2]/div[3]/div[2]/button', { timeout: btnCreateTeamTimeout, visible: true })
    let startFlag =  await page.waitForXPath(createTeamSelecotr, { timeout: btnCreateTeamTimeout, visible: true })
        .then(()=> { console.log('start the match'); return true; })
        .catch(async ()=> {
            if (findOpponentDialogStatus === 2) console.log('Is this account timed out from battle?');
            console.log('btn--create-team not detected');
            return false;
        });
    console.log("findCreateTeamButton startFlag ",startFlag)
    if(!startFlag) {
       return await page.waitForXPath(createTeamSelecotr, { timeout: btnCreateTeamTimeout * 2 , visible: true})
        .then(()=> { console.log('start the match'); return true; })
        .catch(async ()=> {
            if (findOpponentDialogStatus === 2) console.log('Is this account timed out from battle?');
            console.log('btn--create-team not detected');
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
    let btnCreateTeamTimeout = 50000*2;
    // 1  pre battle:  check is already start a battle and search enemy
    let findOpponentDialogStatus = await findSeekingEnemyModal(page);
    // 1.1  pre battle: create team
    let isStartBattleSuccess = await findCreateTeamButton(page, findOpponentDialogStatus);

    while (!isStartBattleSuccess && retriesNum <= maxRetries) {
        console.log(`Launch battle iter-[${retriesNum}]`)
        if (findOpponentDialogStatus === 0) {
            console.log('waiting for battle button')
            // 2  wait BATTLE btn and click start battle , new battle
            isStartBattleSuccess = await page.waitForXPath("//*[@id='battle_category_btn']", { timeout: 20000 })
                .then(button => { button.click(); console.log('Battle button clicked'); return true })
                .catch(()=> { console.error('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'); return false; });
            if (!isStartBattleSuccess) { await reload(page); await sleep(5000); retriesNum++; continue }
            // 3  search enemy dialog modal
            findOpponentDialogStatus = await findSeekingEnemyModal(page);
        }

        console.log("findOpponentDialogStatus : " , findOpponentDialogStatus)
        if (findOpponentDialogStatus === 1 || findOpponentDialogStatus === 2) {
            if (findOpponentDialogStatus === 2) {
                console.log('opponent found?');
                btnCreateTeamTimeout = 5000;
            }
            isStartBattleSuccess = await findCreateTeamButton(page, findOpponentDialogStatus, btnCreateTeamTimeout);
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
    await sleep(6000)
    await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, { timeout: 15000 })
        .then(card => { card.click(); console.log(chalk.bold.greenBright(teamToPlay.summoner, 'clicked')); })
        .catch(()=>{
            clicked = false;
            console.log(chalk.bold.redBright('Summoner not clicked.'))
        });

    return clicked
}

async function clickFilterElement(page, teamToPlay, matchDetails) {
    let clicked = true;
    const playTeamColor = teamActualSplinterToPlay(teamToPlay.cards.slice(0, 6)) || matchDetails.splinters[0]
    await sleep(4000)
    console.log('Dragon play TEAMCOLOR', playTeamColor)
    await page.waitForXPath(`//div[@data-original-title="${playTeamColor}"]`, { timeout: 8000 })
        .then(selector => { selector.click(); console.log(chalk.bold.greenBright('filter element clicked')) })
        .catch(()=> {
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
            clicked = await  clickWithCheck(page,teamToPlay,i)
            if(!clicked) {
                console.log('break play: ', teamToPlay.cards[i].toString());
            }
        } else {
            console.log('nocard ', i);
        }

    }
    return clicked
}

async function clickWithCheck(page, teamToPlay,i){
    let clicked = true;
    await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]/img`, { timeout: 20000 ,visible: true})
    .then(card => {
        card.focus();
        card.click();
        console.log(chalk.bold.greenBright(teamToPlay.cards[i], 'clicked'));
    })
    .catch(()=> {
        clicked = false;
        console.log(chalk.bold.redBright(teamToPlay.cards[i], 'not clicked'));
        summaryLogger.error("may be rule escape:",teamToPlay.cards,teamToPlay.cards[i])
    });

    await page.waitForTimeout(1000);

    const selector = "div[card_detail_id='"+teamToPlay.cards[i].toString()+"'] > img"
    await  page.evaluate((selector) => {
        console.log("selector:",selector)
        return document.querySelector(selector).click()
    },selector);

    await page.waitForTimeout(3000);

    // check
    await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`, { timeout: 20000 })
    .then(card => card.getProperty('className'))
    .then((cn) => cn.jsonValue())
    .then(className => {
        console.log(className)
        if(className.indexOf("card--selected") ==  -1) {
            clicked = false;
            console.log(teamToPlay.cards[i],":","clicked=false")
        } else {
            console.log(teamToPlay.cards[i],":","check selected")
        }
    })
    .catch(()=> {
        clicked = false;
        console.log(chalk.bold.redBright(teamToPlay.cards[i], 'check not clicked'));
    });

    return clicked;
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function clickCreateTeamButton(page) {
    let clicked = true;

    await reload(page);
    await page.waitForTimeout(20000);
    await page.waitForSelector('.btn--create-team', { timeout: 20000 })
        .then(e=> { e.click(); console.log('btn--create-team clicked'); })
        .catch(()=>{
            clicked = false;
            console.log('Create team didnt work. Did the opponent surrender?');
        });

    return clicked
}

async function clickCards(page, teamToPlay, matchDetails) {
    const maxRetries = 6;
    let retriesNum = 1;
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
        if (card.color(teamToPlay.cards[0]) === 'Gold' && !await clickFilterElement(page, teamToPlay, matchDetails)) {
            retriesNum++;
            continue
        }
        await page.waitForTimeout(5000 * 1);

        if (!await clickMembersCard(page, teamToPlay)) {
            retriesNum++;
            continue
        }
        allCardsClicked = true;
    }

    return allCardsClicked
}

async function startBotPlayMatch(page, browser) {

    console.log( new Date().toLocaleString(), 'opening browser...')

    try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
            await page.setViewport({
                width: 1800,
                height: 1600,
                deviceScaleFactor: 1,
            });
            await page.goto('https://splinterlands.io/').catch(() =>{
                console.log("opening browser error ......")
                throw new PageRestartException(`Restart needed.`);
            });
    } catch (e) {
        console.log("page session error")
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
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
        await page.waitForTimeout(8000*3);

        let item = await page.waitForSelector('#log_in_button > button', {
            visible: true,
        })
        .then(res => res)
        .catch(()=> console.log('Already logged in'))

        if (item != undefined)
        {console.log('Login attempt...')
            await splinterlandsPage.login(page, account, password).catch(e=>{
                console.log(e);
                runStat = true;
                throw new Error('Login Error');
            });
        }

        await page.goto('https://splinterlands.io/?p=battle_history');//https://splinterlands.com/
        await page.waitForTimeout(8000);
        await page.reload();
        await page.waitForTimeout(8000*3);
        await closePopups(page);
        await closePopups(page);

        await uplevelLeage(page)

        const rating = await checkRating(page);
        const power = await checkPower(page);
        const ecr = await checkEcr(page);
        const dec = await checkDec(page)
        const league = await  checkLeague(page)
        // const nextQuestTime = await  checkNextQuest(page)
        const deltaDec= preOwnDec > 0  && preOwnDec != dec ? dec - preOwnDec : preDeltaDec ;
        preOwnDec = dec;
        preDeltaDec = deltaDec;
        const deltaPower = preOwnPower > 0 && preOwnPower != power ? power - preOwnPower : preDeltaPower;
        preOwnPower = power;
        preDeltaPower = deltaPower;
        // if (ecr === undefined) throw new Error('Fail to get ECR.')
        console.log('getting user quest info from splinterlands API...')

        // check focus new quest , current focus quest  end
        await focusNewQuest(page);

        // do daily quest claim
        const isClaimDailyQuestMode = process.env.CLAIM_DAILY_QUEST_REWARD === 'false' ? false : true;
        const isPowerAndRating =  parseInt(power) >= 15000  && parseInt(rating) >=1000 ;
        const isLeageBRONZE = league ? league.indexOf("BRONZE") != -1 : false;
        console.log("isLeageBRONZE ," , isLeageBRONZE)
        // TODO auto claim daily
        if (isClaimDailyQuestMode === true ) {
            if(isPowerAndRating && !isLeageBRONZE) { // serviler I check
                await doDailyClaim(page);
            }
        }
        await page.waitForTimeout(5000*5);

        // get quest info
        let quest = await getQuest(page);
        if(!quest) {
            console.log('Error for quest details. Splinterlands API didnt work or you used incorrect username, remove @ and dont use email')
            await page.waitForTimeout(5000*5);
            quest = await getQuest(page);
            if(!quest) {
                throw new LostTooMatchException("no quest ........")
            }
        } else {
            console.log("quest:",quest)
        }

        const nextQuestTime = quest.nct

        //if quest done claim reward. default to true. to deactivate daily quest rewards claim, set CLAIM_DAILY_QUEST_REWARD false in the env file
        console.log('claim daily quest setting:', process.env.CLAIM_DAILY_QUEST_REWARD, 'Quest details: ', quest);
        // ask.logger.log('claim daily quest setting:', process.env.CLAIM_DAILY_QUEST_REWARD, 'Quest details: ', quest);
        // TODO
        // if(quest && quest?.total > quest?.completed) {
        //     dailyClaim = false;
        // }


        // match rule skip , get new quest
        if(process.env.SKIP_QUEST && quest?.splinter && process.env.SKIP_QUEST.split(',').includes(quest?.splinter) ) {
            await newQuest(page,false)
        }

        // const isQuestFinishedAndLowECR = ecr && process.env.ECR_STOP_LIMIT  && ecr <= parseFloat(process.env.ECR_STOP_LIMIT)
        //     && quest?.total == quest?.completed;

        //TODO
        // && quest?.total > parseInt(process.env.TARGET_FP)  && quest?.total - quest?.completed >= parseInt(process.env.TARGET_FP)
        const isWaitForBeginWithHighECR = ecr && process.env.ECR_RECOVER_TO &&  ecr <= parseFloat(process.env.ECR_RECOVER_TO) ;
            // && quest?.total == quest?.completed;
        const checkRatingAndPower =  parseInt(power) >= 10000 && parseInt(rating) >=1050 ||  parseInt(power) < 10000
        // task finish analysis
        let isNotEnoughtTimeFinish = isDailyTaskWithoutEnoughTime(quest);
        // fc == 0
        if(isNotEnoughtTimeFinish && getNewDailyClaim == false && quest.fc == 0) {
            await newQuest(page,true);
            if(getNewDailyClaim) {
                console.log("isNotEnoughtTimeFinish but  not getNewDailyClaim ... do new Quest try , getNewDailyClaim:",getNewDailyClaim ,"quest.fc:",quest.fc)
                isNotEnoughtTimeFinish = false;
            }
        }

        // do sleep
        if ( (isWaitForBeginWithHighECR &&  quest.fc >= 0 &&  quest.completed/quest.total <= 0.3 || isNotEnoughtTimeFinish ) && checkRatingAndPower  ) {
            console.log("checkRatingAndPower",checkRatingAndPower , parseInt(process.env.TARGET_FP))
            // if (ecr < parseFloat(process.env.ECR_STOP_LIMIT)) {
            //     console.log(chalk.bold.red(`ECR lower than limit ${process.env.ECR_STOP_LIMIT}%. reduce the limit in the env file config or wait until ECR will be at ${process.env.ECR_RECOVER_TO || '100'}%`));
            // } else if (ecr < parseFloat(process.env.ECR_RECOVER_TO)) {
            //     console.log(chalk.bold.red(`ECR Not yet Recovered to ${process.env.ECR_RECOVER_TO}`));
            // }
            //
            // // calculating time needed for recovery
            // ecrNeededToRecover = parseFloat(process.env.ECR_RECOVER_TO) - parseFloat(ecr);
            // recoveryTimeInHours = Math.ceil(ecrNeededToRecover / ecrRecoveryRatePerHour);
            const random =  Math.ceil(Math.random()*10)* 60000
            console.log(chalk.bold.white(`Time needed to recover ECR, approximately ${1 * 60 + random/60000 } minutes.ecr:`),ecr ,isWaitForBeginWithHighECR);
            // await closeBrowser(browser);
            console.log(chalk.bold.white(`Initiating sleep mode. The bot will awaken at ${new Date(Date.now() + 1 * 3600 * 1000 + random).toLocaleString()}`));
            // logsummsary
            const summaryInfo = {time: new Date(Date.now() + 1 * 3600 * 1000 + random).toLocaleTimeString() ,NQT:nextQuestTime,CT: claimTime ,  user: process.env.ACCOUNT, NQ: getNewDailyClaim , ECR: ecr , WC: winTotal , LC: loseTotal  , FC : quest.fc
                , WR: (winTotal /(winTotal+loseTotal)).toFixed(2) , dec: totalDec.toFixed(2)
                , quest: quest != null ? quest?.splinter : "-" , LW:  "-" , qt: quest != null ? quest?.total  : "-" , qc:quest != null ? quest?.completed  : "-" ,rating:rating ,power :power+"("+deltaPower+")" ,tDEC:dec+"("+deltaDec+")" ,league:league };

            doSummaryLog(summaryInfo)

            await sleep(1 * 3600 * 1000+random);
            runStat = true;
            throw new Error(`Restart needed.`);
        }



        console.log('getting user cards collection from splinterlands API...')
        // const myCards = await getCards()
        //     .then((x)=>{console.log('cards retrieved'); return x})
        //     .catch(()=>console.log('cards collection api didnt respond. Did you use username? avoid email!'));

        let myCards = []
        await user.getPlayerCards(account.toLowerCase()).then(x => myCards.push(...x))

        if(myCards) {
            console.log(account, ' deck size: '+myCards.length)
        } else {
            console.log(account, ' playing only basic cards')
        }

        //check if season reward is available
        if (process.env.CLAIM_SEASON_REWARD === 'true') {
            try {
                console.log('Season reward check: ');
                await page.waitForSelector('#claim-btn', { visible:true, timeout: 10000 })
                .then(async (button) => {
                    button.click();
                    console.log(`claiming the season reward. you can check them here https://peakmonsters.com/@${account}/explorer`);
                    await page.waitForTimeout(20000*2);
                    await page.reload();

                })
                .catch(()=>console.log(`no season reward to be claimed, but you can still check your data here https://peakmonsters.com/@${account}/explorer`));
                await page.waitForTimeout(3000*3);
                await page.reload();
            }
            catch (e) {
                console.info('no season reward to be claimed')
            }
        }


        console.info(' The Battle for the battle.....')
        // LAUNCH the battle
        if (!await launchBattle(page)) throw new Error('The Battle cannot start');

        // #666#  开始配置 GET MANA, RULES, SPLINTERS, AND POSSIBLE TEAM
        console.time("battle")
        await page.waitForTimeout(15000);
        let [mana, rules, splinters,enemyRecent] = await Promise.all([
            splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
            splinterlandsPage.checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
            splinterlandsPage.checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters'),
            splinterlandsPage.checkMatchEnemy(page).then((enemyRecent) => enemyRecent).catch(() => 'no enemyRecent')
        ]);

        if(mana == "no mana"){
            console.log("excepiton no mana , do again")
            await page.waitForTimeout(10000);
            [mana, rules, splinters,enemyRecent] = await Promise.all([
                splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
                splinterlandsPage.checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
                splinterlandsPage.checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters'),
                splinterlandsPage.checkMatchEnemy(page).then((enemyRecent) => enemyRecent).catch(() => 'no enemyRecent')
            ]);
        }

        if(mana == "no mana"){
            console.log("still no mana , do return")
            return;
        }

        const matchDetails = {
            orgMana: mana,
            mana: mana,
            rules: rules,
            splinters: splinters,
            myCards: myCards,
            enemyRecent: enemyRecent,
            rating:rating,
            quest: quest.splinter,
            logContent:{account:account,isWin:'',mana:mana ,rules:rules,splinters:splinters.join("|")}
        }
        await page.waitForTimeout(2000*2);

        console.timeLog("battle","2 battle init matchDetails finished")
        let possibleTeams = await ask.possibleTeams(matchDetails, account).catch(e=>console.log('Error from possible team API call: ',e));
        console.timeLog("battle","3 battle possibleTeams finished")
        matchDetails['logContent']['possibleTeams'] = possibleTeams.length

        if (possibleTeams && possibleTeams.length) {
            console.log('1 Possible Teams based on your cards: ', possibleTeams.length);
        } else {
            throw new Error('NO TEAMS available to be played');
        }

        //TEAM SELECTION
        const teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest, page.favouriteDeck);
        console.timeEnd("battle")
        let startFightFail = false;
        if (teamToPlay) {
            await page.$eval('.btn--create-team', elem => elem.click())
                .then(()=>console.log('btn--create-team clicked'))
                .catch(async ()=>{
                    console.log('Create team didnt work, waiting 5 sec and retry');
                    await page.reload();
                    await page.waitForTimeout(5000*2);
                    await page.$eval('.btn--create-team', elem => elem.click())
                        .then(()=>console.log('btn--create-team clicked'))
                        .catch(()=>{
                            startFightFail = true;
                            console.log('Create team didnt work. Did the opponent surrender?');
                        });
                });
            if (startFightFail) return
        } else {
            throw new Error('Team Selection error: no possible team to play');
        }

        await page.waitForTimeout(10000);

        // Click cards based on teamToPlay value.
        if (!await clickCards(page, teamToPlay, matchDetails)) return

        // start fight
        await page.waitForTimeout(5000);
        await page.waitForSelector('.btn-green', { timeout: 3000 }).then(()=>console.log('btn-green visible')).catch(()=>console.log('btn-green not visible'));
        await page.$eval('.btn-green', elem => elem.click())
            .then(()=>console.log('btn-green clicked'))
            .catch(async ()=>{
                console.log('Start Fight didnt work, waiting 5 sec and retry');
                await page.waitForTimeout(5000);
                await page.$eval('.btn-green', elem => elem.click())
                    .then(()=>console.log('btn-green clicked'))
                    .catch(()=>{
                        startFightFail = true;
                        console.log('Start Fight didnt work. Did the opponent surrender?');
                    });
            });
        if (startFightFail) return

        let isWin = "F";

        await page.waitForTimeout(5000);
        let isRumbleVisable = true;
        await page.waitForSelector('#btnRumble', { timeout: 90000 }).then(()=>console.log('btnRumble visible')).catch(()=>{console.log('btnRumble not visible'); isRumbleVisable = false;});
        await page.waitForTimeout(5000);
        if(!isRumbleVisable){
            await page.waitForSelector('#btnRumble', { timeout: 90000 }).then(()=>console.log('btnRumble visible')).catch(()=>{console.log('btnRumble not visible'); isRumbleVisable = false;});
        }
        await page.$eval('#btnRumble', elem => elem.click()).then(()=>console.log('btnRumble clicked')).catch(()=>console.log('btnRumble didnt click')); //start rumble
        await page.waitForSelector('#btnSkip', { timeout: 10000 }).then(()=>console.log('btnSkip visible')).catch(()=>console.log('btnSkip not visible'));
        await page.$eval('#btnSkip', elem => elem.click()).then(()=>console.log('btnSkip clicked')).catch(()=>console.log('btnSkip not visible')); //skip rumble
        await page.waitForTimeout(5000);
            try {
                const winner = await getElementText(page, 'section.player.winner .bio__name__display', 15000);
                console.log("result win : ",winner.trim() ,':' , account.toLowerCase()  )
                if (winner.trim() == account.toLowerCase()) {
                    isWin = "T";
                    const decWon = await getElementText(page, '.player.winner span.dec-reward span', 1000);
                    console.log(chalk.green('You won! Reward: ' + decWon + ' DEC'));
                    // ask.logger.log('You won! Reward: ', decWon , ' DEC');
                    totalDec += !isNaN(parseFloat(decWon)) ? parseFloat(decWon) : 0 ;
                    winTotal += 1;

                    // ---------- check daily claim start TODO
                    if (isClaimDailyQuestMode === true ) {
                        if(isPowerAndRating && !isLeageBRONZE) { // serviler I check
                            await doDailyClaim(page);
                        }
                    }
                    // await page.waitForTimeout(5000*5);
                    // ---------- check daily claim end
                }
                else {
                    console.log(chalk.red('You lost'));
                    // ask.logger.log('You lost');
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

            console.log('Total Battles: ' + (winTotal + loseTotal + undefinedTotal) + chalk.green(' - Win Total: ' + winTotal) + chalk.yellow(' - Draw? Total: ' + undefinedTotal) + chalk.red(' - Lost Total: ' + loseTotal), " nextQuestTime:",nextQuestTime);
            console.log(chalk.green('Total Earned: ' + totalDec + ' DEC'));

            // ask.logger.log(account,'Total Battles: ' + (winTotal + loseTotal + undefinedTotal) + chalk.green(' - Win Total: ' + winTotal) + chalk.yellow(' - Draw? Total: ' + undefinedTotal) + chalk.red(' - Lost Total: ' + loseTotal));
            // ask.logger.log(account,chalk.green('Total Earned: ' + totalDec + ' DEC'));
            const summaryInfo = {time: new Date().toLocaleTimeString() ,NQT:nextQuestTime,CT: claimTime ,  user: process.env.ACCOUNT, NQ: getNewDailyClaim  , ECR: ecr , WC: winTotal , LC: loseTotal , FC : quest.fc
                , WR: (winTotal /(winTotal+loseTotal)).toFixed(2) , dec: totalDec.toFixed(2)
                , quest: quest?.splinter  + ":" + teamToPlay.cards[7] , LW:  isWin , qt:quest?.total, qc:quest?.completed ,rating:rating ,power :power+"("+deltaPower+")" ,tDEC:dec+"("+deltaDec+")" ,league:league };

            doSummaryLog(summaryInfo)

            matchDetails['logContent']['isWin'] = isWin
            matchDetails['logContent']['rating'] = rating
            // ask.logger.table([matchDetails['logContent']])
            runStat = true;
            runFlgCnt = 0;
            await csvWriter.writeRecords([matchDetails['logContent']]).then(()=> console.log('The CSV file was written successfully'));
    } catch (e) {
            const summaryInfo = {time: new Date().toLocaleTimeString() ,  user: process.env.ACCOUNT , win: winTotal , lost: loseTotal , draw : undefinedTotal, dec: totalDec , reason: e};
            summaryLogger.error(summaryInfo)
            console.log('Error handling browser not opened, internet connection issues, or battle cannot start:', e)
            if(runStat == false){
                runFlgCnt ++;
            }
            runStat = false;
    }
}

async function focusNewQuest(page){
    try {
        await page.waitForXPath('//*[@id="focus_new_btn"]', { timeout: 5000 ,visible: true})
        .then(fbtn  => fbtn.click())
        .then(()=> console.log('1  focus_new_btn New quest clicked ', new Date()))
        .then(()=> page.waitForTimeout(30000))
        .then(async ()=>{
            await page.reload();
            console.log('1.1  focus_new_btn New quest page reload', new Date())})
        .then(()=> page.waitForTimeout(30000))
        .then(()=> console.log('1.2  focus_new_btn New quest reload wait end  ', new Date()))
        .then(() =>{
            resetDailyStat();
        })
        .catch(e=>console.log('2. Cannot click on focus_new_btn'))
    } catch (e) {
        console.log('2. Error while start new quest')
    }
}
function resetDailyStat(){
    winTotal=0;
    undefinedTotal=1;
    loseTotal=0;
    totalDec=0;
    getNewDailyClaim = false;
}

async function doDailyClaim(page) {
    try {
        await page.waitForSelector('#quest_claim_btn', { timeout: 5000*2 })
        .then(button =>  button.click() ).then(() => {
            dailyClaim = true;
            resetDailyStat();
            const tm = new Date().toLocaleString('en-GB').split(",")
            claimTime = tm[0].split("/")[0] + tm[1].slice(0,6)
            page.waitForTimeout(60000);
        });
    } catch (e) {
        dailyClaim = false;
        console.info('no quest reward to be claimed waiting for the battle...')
    }
}

async function newQuest(page , isNotEnoughtTime){
    try {
        await page.click('#quest_new_btn')
        .then(() => page.waitForTimeout(20000))
        .then(async a=>{
            await page.reload();
            console.log('New quest requested');
            getNewDailyClaim = isNotEnoughtTime;
        })
        .then(() => page.waitForTimeout(30000))
        .catch(e=>console.log('Cannot click on new quest'))

    } catch(e) {
        console.log('Error while skipping new quest')
    }
}

function isDailyTaskWithoutEnoughTime(quest) {
    if(quest == null ){
        return false;
    }

    if(quest.nct == null  ||  quest.nct.trim().length  == 0  ){
        return false;
    }
    let remainHours = parseInt(quest.nct.split(":")[0])
    const remainMiniutes = parseInt(quest.nct.split(":")[1])
    if(remainHours == 0 && remainMiniutes <=20 ){
        return false;
    }

    if(remainMiniutes >= 35){
        remainHours = remainHours + 0.5;
    }
    // least run end hours  23:59 , 22:59 , 21,20,19,18
    // 16 =8, 18 = 6, 20 = 4 ,
    let leastEndHours = 22;
    //  init quest failed , new quest try 8 hours
    if(getNewDailyClaim ) {
        console.log("isNotEnoughtTimeFinish but  not getNewDailyClaim true , try more  ...")
        leastEndHours = 19;
    }
    // least 4 hours running
    if(remainHours >= leastEndHours  ) {
        return false;
    }

    let checkResult = false;
    let startHour = 24;
    const dpRate = ( quest.completed + quest.total * quest.fc ) / (startHour - remainHours)
    const remainDp  =  quest.total -  quest.completed;
    if(remainDp - dpRate * remainHours >= -(remainHours * (40 +  remainHours))  ){
        checkResult = true;
    }

    if(checkResult){
        console.log("*****DailyTaskWithoutEnoughTime : " , quest.nct , quest.total , quest.completed ,quest.fc);
        console.log("dpRate:",dpRate , "per/hour  remainDp:", remainDp , "remainHours:",remainHours ,"tryNew:",getNewDailyClaim,-(remainHours * 40))
    }
    return checkResult;
}

function doSummaryLog(summaryInfo){
    delete require.cache[require.resolve("./data/log/stat.json")]
    let statJson = require('./data/log/stat')
    statJson[process.env.ACCOUNT] = summaryInfo
    fs.writeFile(`./data/log/stat.json`, JSON.stringify(statJson), function (err) {
        if (err) {
            console.log(err);
        }
    });

    let summaryArray = []
    statJson['users'].forEach( user =>{
        if(statJson[user]){
            summaryArray.push(statJson[user])
        }
    })

    summaryLogger.table(summaryArray)
}

// 30 MINUTES INTERVAL BETWEEN EACH MATCH (if not specified in the .env file)
const isHeadlessMode = process.env.HEADLESS === 'false' ? false : true;
console.log("isHeadlessMode:",isHeadlessMode)
const executablePath = process.env.CHROME_EXEC || null;
const config = require('./config/config');

let puppeteer_options = {
    browserWSEndpoint: 'ws://192.168.99.100:'+ process.env.wsport,
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


const blockedResources = [
    'splinterlands.com/players/item_details',
    'splinterlands.com/players/event',
    'splinterlands.com/market/for_sale_grouped',
    'splinterlands.com/battle/history2',
    'splinterlands.com/players/messages',
    'facebook.com',
    'google-analytics.com',
    'twitter.com',
];

function LostTooMatchException(message){
    this.message = message;
}

function PageRestartException(message){
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

    // NOT WORKING on ALL the machines
    // await page.setRequestInterception(true);
    // page.on('request', (interceptedRequest) => {
    //     //    console.log("URL: " + interceptedRequest.url())
    //     //            page.on('request', (request) => {
    //         // BLOCK CERTAIN DOMAINS
    //         if (blockedResources.some(resource => interceptedRequest.url().includes(resource))){
    //     //        console.log("Blocked: " + interceptedRequest.url());
    //             interceptedRequest.abort();
    //         // ALLOW OTHER REQUESTS
    //         } else {
    //             interceptedRequest.continue();
    //     }
    //       });
    await page.setDefaultNavigationTimeout(500000);
    await page.on('dialog', async dialog => {
        await dialog.accept();
    });
    await page.on('error', function(err) {
        const errorMessage = err.toString();
        console.log('browser error: ', errorMessage)
    });
    await page.on('pageerror', function(err) {
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
        if(runFlgCnt >= 3) {
            console.log("too many error" )
            const summaryInfo = {time: new Date().toLocaleTimeString() ,  user: process.env.ACCOUNT , win: winTotal , lost: loseTotal , draw : undefinedTotal, dec: totalDec , reason: "LostTooMatchException"};
            summaryLogger.error(summaryInfo)
            throw new LostTooMatchException("win : " + winTotal , " lost :" + loseTotal)
        }
        if( (winTotal+loseTotal) >=40  && loseTotal/(winTotal+loseTotal) >= 0.7 ){
            console.log("LostTooMatchException win : " + winTotal , " lost :" + loseTotal )
            const summaryInfo = {time: new Date().toLocaleTimeString() ,  user: process.env.ACCOUNT , win: winTotal , lost: loseTotal , draw : undefinedTotal, dec: totalDec , reason: "LostTooMatchException"};
            summaryLogger.error(summaryInfo)
            throw new LostTooMatchException("win : " + winTotal , " lost :" + loseTotal)
        }

        if((winTotal+loseTotal +undefinedTotal) >= parseInt(process.env.max_cnt) ) {
            console.log('process.env.max_cnt matched stop: ', process.env.max_cnt)
            const summaryInfo = {time: new Date().toLocaleTimeString() ,  user: process.env.ACCOUNT , win: winTotal , lost: loseTotal , draw : undefinedTotal, dec: totalDec , reason: 'process.env.max_cnt matched stop: '+ process.env.max_cnt};
            summaryLogger.error(summaryInfo)
            throw new LostTooMatchException("process.env.max_cnt matched stop : " +  process.env.max_cnt)
        }

        if(!process.env.API) {
            console.log(chalk.bold.redBright.bgBlack('Dont pay scammers!'));
            console.log(chalk.bold.whiteBright.bgBlack('If you need support for the bot, join the telegram group https://t.me/splinterlandsbot and discord https://discord.gg/bR6cZDsFSX'));
            console.log(chalk.bold.greenBright.bgBlack('If you interested in a higher winning rate with the private API, contact the owner via discord or telegram'));
        }
        await startBotPlayMatch(page, browser)
            .then(async () => {
                console.log('Closing battle', new Date().toLocaleString());

                if (isMultiAccountMode) {
                    start = false;
                    await closeBrowser(browser);
                } else {
                    await page.waitForTimeout(5000);
                    const sleepingTimeInMinutes = process.env.MINUTES_BATTLES_INTERVAL;
                    const sleepingTime = sleepingTimeInMinutes * 60000;
                    //Math.ceil(Math.random()*2)* 60000 +
                    let randomTime =  sleepingTime ;
                    if((winTotal+loseTotal) >=30 &&  loseTotal/(winTotal+loseTotal) >= 0.7 ){
                        randomTime = 15 * 60000;
                        console.log("LostTooMatchException win : " + winTotal , " lost :" + loseTotal , "waittime mutil 3 :" , randomTime )
                    }
                    console.log(account, 'waiting for the next battle in', randomTime / 1000 / 60 , 'minutes at', new Date(Date.now() + randomTime).toLocaleString());
                    // ask.logger.log(account, 'waiting for the next battle in', randomTime / 1000 / 60 , 'minutes at', new Date(Date.now() + randomTime).toLocaleString());
                    await sleep(randomTime);
                }
            })
            .catch((e) => {
                console.log(e);
                start = false;
                const summaryInfo = {time: new Date().toLocaleTimeString() ,  user: process.env.ACCOUNT , win: winTotal , lost: loseTotal , draw : undefinedTotal, dec: totalDec , reason: e};
                summaryLogger.error(summaryInfo)
                if(e instanceof  PageRestartException) {
                    needRestart = true;
                    console.log("1 PageRestartException .........")
                }
            })
    }
    if(needRestart) {
        console.log("2.1 page close .........")
        browser.pages().then((pages) => {
            pages.map((page) => page.close().then("needRestart page closed")
            .catch(() =>{console.log("needRestart pages close error")}))
        });

        await sleep(10000);
        console.log("2.2 browser close .........")
        if(await  browser.isConnected()){
            browser.close().then(() => console.log("needRestart browser closed....")).catch(() => {console.log("needRestart browser close error")})
        }

        await sleep(10000);

        console.log("2.2 browser process kill .........")
        if (browser && browser.process() != null) browser.process().kill('SIGINT');

        console.log("3 page restarting .........")
        await run();
    }
}

function delayPromise(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
function timeoutPromise(promise, ms) {
    var timeout = delayPromise(ms).then(function () {
        throw new Error('Operation timed out after ' + ms + ' ms');
    });
    return Promise.race([promise, timeout]);
}

async function closeBrowser(browser) {
    console.log('Closing browser...')
    await browser.close()
        .then(()=>{console.log('Browser closed.')})
        .catch((e)=>{console.log(chalk.bold.redBright.bgBlack('Fail to close browser. Reason:'), chalk.bold.whiteBright.bgBlack(e.message))});
}

async function restart(browser) {
    console.log(chalk.bold.redBright.bgBlack('Restarting bot...'))
    await closeBrowser(browser);
    await run();
}

function setupAccount(uname, pword, multiAcc) {
    account = uname;
    password = pword;
    isMultiAccountMode = multiAcc;
}

exports.run = run;
exports.setupAccount = setupAccount;
module.exports.LostTooMatchException = LostTooMatchException
