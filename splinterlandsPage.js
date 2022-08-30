const { getElementText } = require('./helper');
const cardsDetail = require('./data/cardsDetails');

async function login(page, account, password) {
    try {
        await page.waitForSelector('#log_in_button > button').then(() => page.waitForTimeout(3000 * 3))
        .then(() => page.click('#log_in_button > button')).then(() => console.log("login in button clicked : " , account + " " + password ))
        .catch((e)=> console.log("login in button click error......",e))

        // await page.waitForSelector('#login_dialog_v2 > div > div > div.modal-body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > a',{timeout: 3000})
        // .then(() => page.click('#login_dialog_v2 > div > div > div.modal-body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > a'))
        // .then(() => console.log("login_dialog_v2  use email clicked ......"))
        // .then(() => page.waitForTimeout(1000)) .catch((e)=> console.log("login_dialog_v2  error......",e))

        await page.waitForSelector('#email')
            .then(() => console.log("email  visable ......"))
            .then(() => page.waitForTimeout(1000))
            .then(() => page.focus('#email'))
            .then(() => page.type('#email', account))
            .then(() => console.log("email  input finished ......"))
             .then(() => page.waitForTimeout(3000))

        await page.waitForSelector('#password')
            .then(() => console.log("password  visable ......"))
            .then(() => page.focus('#password'))
            .then(() => page.type('#password', password))
            .then(() => console.log("password  input finished ......"))
            .then(() => page.waitForTimeout(3000))
            // .then(() => page.waitForSelector('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button', { visible: true }).then(() => page.click('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button')))

        await page.waitForSelector('#loginBtn')
           .then(() => console.log("loginBtn  visable ......"))
           .then(() => page.click('#loginBtn'))
            .then(() => page.waitForTimeout(15000))
            // .then(() => page.click('#loginBtn'))
            .then(() => console.log("loginBtn clicked........."))
            // .then(() => page.reload())
            .then(() => console.log("loginBtn reload........."))
            // .then(() => page.waitForTimeout(3000))
            // .then(() => page.click('#loginBtn'))
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
            .then(() => page.waitForTimeout(10000))
            .then(() => page.reload())

    } catch (e) {
        console.log(e)
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

async function checkMatchEnemy(page) {
    console.log("checkMatchEnemy v2 .........")
    try {
        const teams = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section:nth-child(1) > div > div.bio > div:nth-child(2) > div.recently-played-splinters > span.recently-played-splinters__list > div > div > ul",
            ul =>ul.map(u => {
                const tms =  u.getElementsByClassName("team__monster")
                let titles = []
                for (let i = 0; i < tms.length ; i++) {
                    const title =  tms[i].getAttribute("data-original-title");
                    titles.push(title);
                }
                return titles;
            }));

        // console.log("teams:",teams)
        const recent_team =  teams.map( teamTitles =>{
            let parseTeam = {};
            let totalMana = 0;
            for (let i = 0; i < teamTitles.length; i++) {
                const titleAttr =  teamTitles[i]
                if(titleAttr != null){
                    let sp = titleAttr.split('★')
                    const cardId = cardsDetail.cardsDetailsNameMap[sp[0].trim()]['cardDetailId'];
                    const cardLevel = parseInt(sp[1].trim())
                    const mana = parseInt(cardsDetail.cardsDetailsNameMap[sp[0].trim()]['statSum1']['mana'])
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
            return parseTeam;
        })

        // console.log("checkMatchEnemy v2 ...recent_team:",recent_team)
        return recent_team;
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
