const battlesGet = require('./battlesGet');
const { getElementText } = require('./helper');

async function login(page, account, password) {
    try {
        await page.waitForSelector('#log_in_button > button').then(() => page.waitForTimeout(3000 * 3)).then(() => page.click('#log_in_button > button'))
        console.log("login in button clicked : " , account + " " + password )
        await page.waitForSelector('#email')
            .then(() => page.waitForTimeout(3000))
            .then(() => page.focus('#email'))
            .then(() => page.type('#email', account))
             .then(() => page.waitForTimeout(3000))
            .then(() => page.focus('#password'))
            .then(() => page.type('#password', password))
            .then(() => page.waitForTimeout(30000))
            // .then(() => page.waitForSelector('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button', { visible: true }).then(() => page.click('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button')))
            .then(() => page.click('#loginBtn'))
            .then(() => page.waitForTimeout(15000))
            // .then(() => page.click('#loginBtn'))
            .then(() => console.log("loginBtn clicked........."))
            // .then(() => page.reload())
            .then(() => console.log("loginBtn reload........."))
            .then(() => page.waitForTimeout(30000))
            .then(() => page.click('#loginBtn'))
            // .then(() => page.reload())
            .then(() => page.waitForTimeout(10000))
            .then(async () => {
                console.log("waitForSelector--------log_in_text ")
                await page.waitForSelector('#log_in_text', {
                        visible: true, timeout: 10000
                    })
                    .then(()=>{
                        console.log('logged in!')
                    })
                    .catch(()=>{
                        console.log('didnt login');
                        throw new Error('Didnt login');
                    })
                })
            .then(() => page.waitForTimeout(20000))
            .then(() => page.reload())

    } catch (e) {
        throw new Error('Check that you used correctly username and posting key. (dont use email and password)');
    }
}

async function checkMana(page) {
    var manas = await page.evaluate(() => {
        var manaCap = document.querySelectorAll('div.mana-total > span.mana-cap')[0].innerText;
        var manaUsed = document.querySelectorAll('div.mana-total > span.mana-used')[0].innerText;
        var manaLeft = manaCap - manaUsed
        return { manaCap, manaUsed, manaLeft };
    });
    console.log('manaLimit', manas);
    return manas;
}

async function checkMatchMana(page) {
    // const mana = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict.combat_info > div:nth-child(2) > div > div", el => el.map(x => x.getAttribute("data-original-title")));
    const mana = await getElementText(page,"#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div:nth-child(6) > div > div > div > div")
    console.log("checkMatchMana :" , mana.trim())
    const manaValue = parseInt(mana.trim(), 10);
    return manaValue;
}

async function checkMatchRules(page) {
    const rules = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div.combat__rules > div > div > img", el => el.map(x => x.getAttribute("data-original-title")));
    return rules.map(x => x.split(':')[0]).join('|')
}

async function checkMatchActiveSplinters(page) {
    const splinterUrls = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div.combat__splinters > div > img",
            el => el.map(x => x.getAttribute("src")));
    return splinterUrls.map(splinter => splinterIsActive(splinter)).filter(x => x);
}


// 对手信息
async function checkMatchEnemy(page) {
    console.log("checkMatchEnemy .........")
    try {
        // const recent_team = await page.$$eval("div.recent-team > div.recent-team-tooltip >  ul.team__monsters > li.team__monster",
        //     el =>el.map(x => x.getAttribute("data-original-title")));
        //
        // let rs = recent_team.map(sm => {
        //     if(sm){
        //         let sp = sm.split('★')
        //         return [sp[0].trim(),sp[1].trim()]
        //     } else {
        //         return ['','']
        //     }
        // })
        //-------------
        const pName = await page.$$eval("div.bio__details > div.bio__name >  span.bio__name__display ",
            el =>el.map(x => x.innerText));

        const enemyBattles = await battlesGet.getBattleDetail(pName[0]);
        console.log("Enemy name :" ,pName , "enemyBattles : ",enemyBattles.length)
        if(enemyBattles && enemyBattles.length >0){
            // const len = enemyBattles.length > 30 ? 30 :  enemyBattles.length;
            // let topBattles = enemyBattles.slice(0,len)
            // console.log("enemyBattles ---:",enemyBattles.length , JSON.stringify(enemyBattles))
            return enemyBattles;
        } else {
            return [];
        }
    } catch (e) {
        console.log(e)
    }
    return []
}
//UNUSED ?
const splinterIsActive = (splinterUrl) => {
    const splinter = splinterUrl.split('/').slice(-1)[0].replace('.svg', '').replace('icon_splinter_', '');
    return splinter.indexOf('inactive') === -1 ? splinter : '';
}

exports.login = login;
exports.checkMana = checkMana;
exports.checkMatchMana = checkMatchMana;
exports.checkMatchRules = checkMatchRules;
exports.checkMatchActiveSplinters = checkMatchActiveSplinters;
exports.splinterIsActive = splinterIsActive;
exports.checkMatchEnemy = checkMatchEnemy;
