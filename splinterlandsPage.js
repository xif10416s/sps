const { getElementText } = require('./helper');
const cardsDetail = require('./data/cardsDetails');

async function login(page, account, password) {
    try {
        await page.waitForSelector('#log_in_button > button').then(() => page.waitForTimeout(3000 * 3))
        .then(() => page.click('#log_in_button > button')).then(() => console.log("login in button clicked : " , account + " " + password ))
        .then(() => page.waitForTimeout(3000))
        .catch((e)=> console.log("login in button click error......",e))

        // await page.waitForSelector('#login_dialog_v2 > div > div > div.modal-body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > a',{timeout: 3000})
        // .then(() => page.click('#login_dialog_v2 > div > div > div.modal-body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > a'))
        // .then(() => console.log("login_dialog_v2  use email clicked ......"))
        // .then(() => page.waitForTimeout(1000)) .catch((e)=> console.log("login_dialog_v2  error......",e))

        await page.waitForNavigation({timeout: 5000}).catch(() =>{});
        var form = await page.evaluate(() => {
            var innerHTML = document.querySelectorAll('#root')[0].innerHTML;
            return innerHTML;
        });
        console.log('form  ', form);

        var isOldVersion = false;
        // #login_dialog_v2 > div > div > div.modal-body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > a
        // await page.waitForSelector('#root > div:nth-child(1) > div.c-kwJzZO.c-kwJzZO-hjLfVT-withoutMinHeight-false > div > div > div > div > form > div.c-ieNaGf')
        await page.waitForXPath('//*[@id="root"]/div[1]/div[1]/div/div/div/div/form/div[2]',{timeout: 5000, visible: true})
       .then(() => console.log("login_dialog_v2 email button visable ......"))
        .then(() => page.waitForTimeout(1000))
        .catch((e) =>{
            //isOldVersion = true;
            console.log("login_dialog_v2 email button not visable ......",e )
        })

        const elements = await page.$x('//*[@id="root"]/div[1]/div[1]/div/div/div/div/form/div[2]')
        if(elements.length >0) {
            await elements[0].click()
            console.log("login_dialog_v2 email button clicked ......")
        } else {
        	console.log("login_dialog_v2 email button not clicked ....2..")
        }

        // check new
        if( !isOldVersion) {
            await page.waitForSelector('#email')
            .then(() => {
                isOldVersion = true;
            }).catch((e) =>{
                //isOldVersion = true;
                console.log("login_dialog_v2 email button not visable ......" )
            })

        }

        if( isOldVersion) {
            console.log("login old version ......+++++++++++++++++" )
            await page.waitForSelector('#email')
            .then((el) => console.log("login email button visable ......" + el.innerHTML))
            .then(() => page.waitForTimeout(1000))
            .then(() => page.click('#email'))
            .then(() => page.waitForTimeout(2000))
            .catch(() =>{
                console.log("login email button not visable ......" )
            })


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
        } else {
            console.log("login new version ......******************" )
//"#root > div:nth-child(1) > div.c-hTwMYH > div > div > div > div > form > div.c-ieNaGf"

            await page.waitForXPath('//*[@id="root"]/div[1]/div[1]/div/div/div/div/form/div[1]/div/input',{timeout: 5000, visible: true})
            .then(() => console.log("email  input  visable ......"))
            .catch((e) =>{
                //isOldVersion = true;
                console.log("email  input not visable ......",e )
            })


            const emailElements = await page.$x(('//*[@id="root"]/div[1]/div[2]/div/div/div/div/form/div[1]/div/input'))
            if(emailElements.length >0) {
                await emailElements[0].focus()
                await emailElements[0].type(account)
                console.log("emailElements input end ......")
            } else {
                console.log("emailElements input  not type ....2..")
            }

            await page.waitForTimeout(3000);

            // await page.waitForSelector('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > div:nth-child(1) > div > input')
            // .then(() => console.log("email  visable ......"))
            // .then(() => page.waitForTimeout(1000))
            // .then(() => page.focus('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > div:nth-child(1) > div > input'))
            // .then(() => page.type('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > div:nth-child(1) > div > input', account))
            // .then(() => console.log("email  input finished ......"))
            // .then(() => page.waitForTimeout(3000))

            var form = await page.evaluate(() => {
                var innerHTML = document.querySelectorAll('#root')[0].innerHTML;
                return innerHTML;
            });
            console.log('form 2 ', form);

            const passElements = await page.$x(('//*[@id="root"]/div[1]/div[2]/div/div/div/div/form/div[2]/div/input'))
            if(passElements.length >0) {
                await passElements[0].focus()
                await passElements[0].type(password)
                console.log("passElements input end ......")
            } else {
                console.log("passElements input  not type ....2..")
            }

            await page.waitForTimeout(3000);


            // await page.waitForSelector('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > div:nth-child(2) > div > input')
            // .then(() => console.log("password  visable ......"))
            // .then(() => page.focus('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > div:nth-child(2) > div > input'))
            // .then(() => page.type('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > div:nth-child(2) > div > input', password))
            // .then(() => console.log("password  input finished ......"))
            // .then(() => page.waitForTimeout(3000))
            // .then(() => page.waitForSelector('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button', { visible: true }).then(() => page.click('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button')))


            const submitEles = await page.$x(('//*[@id="root"]/div[1]/div[2]/div/div/div/div/form/button'))
            if(submitEles.length >0) {
                await submitEles[0].click()
                console.log("login  clicked......")
            } else {
                console.log("login not clicked......")
            }

            await page.waitForNavigation({timeout: 15000}).catch(() =>{});

            // await page.waitForSelector('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > button')
            // .then(() => console.log("loginBtn  visable ......"))
            // .then(() => page.click('#root > div:nth-child(1) > div.c-kAOnKs > div > div > div > div > form > button'))
            // .then(() => page.waitForTimeout(15000))
            // // .then(() => page.click('#loginBtn'))
            // .then(() => console.log("loginBtn clicked........."))
            // // .then(() => page.reload())
            // .then(() => console.log("loginBtn reload........."))
            // // .then(() => page.waitForTimeout(3000))
            // // .then(() => page.click('#loginBtn'))
            // // .then(() => page.reload())
            // .then(() => page.waitForTimeout(10000))
        }


        await page.waitForSelector('#log_in_text', {
            visible: true, timeout: 10000
        }).then(() => console.log("log_in_text visible........."))

        const loginAccount =  await getElementText(page,"#log_in_text > a > div > div.bio__details > span > span")
        console.log("loginAccount:",loginAccount , process.env.ACCOUNT)

        if(loginAccount != null && loginAccount == process.env.ACCOUNT) {
            console.log('logged in!');
        } else {
            console.log('didnt login');
            throw new Error('Didnt login');
        }

        console.log('start login reload',new Date().toLocaleTimeString());
        await page.reload();
        await page.waitForTimeout(20000)
        console.log('end login reload',new Date().toLocaleTimeString());
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
    await page.waitForSelector('#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div:nth-child(6) > div > div > div > div', {visible: true, timeout: 10000})
    .then(() => {
        console.log("checkMatchMana visible")
    }).catch(() => {
        console.log('checkMatchMana not visible', new Date().toLocaleString());
    })
    // const mana = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict.combat_info > div:nth-child(2) > div > div", el => el.map(x => x.getAttribute("data-original-title")));
    const mana = await getElementText(page,"#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div:nth-child(6) > div > div > div > div")
    console.log("checkMatchMana :" , mana.trim())
    const manaValue = parseInt(mana.trim(), 10);
    return manaValue;
}


async function checkMatchRules(page) {
    await page.waitForSelector('#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div.combat__rules > div > div > img', {visible: true, timeout: 10000})
    .then(() => {
        console.log("checkMatchRules visible")
    }).catch(() => {
        console.log('checkMatchRules not visible', new Date().toLocaleString());
    })
    const rules = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div.combat__rules > div > div > img", el => el.map(x => x.getAttribute("data-original-title")));
    console.log("checkMatchRules:",rules)
    return rules.map(x => x.split(':')[0]).join('|')
}


async function checkMatchActiveSplinters(page) {
    await page.waitForSelector('#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div.combat__splinters > div > img', {visible: true, timeout: 10000})
    .then(() => {
        console.log("checkMatchActiveSplinters visible")
    }).catch(() => {
        console.log('checkMatchActiveSplinters not visible', new Date().toLocaleString());
    })
    const splinterUrls = await page.$$eval("#enemy_found_ranked > div > div > div.modal-body > section.combat__conflict > div > div.combat__splinters > div > img",
            el => el.map(x => x.getAttribute("src")));
    console.log("checkMatchActiveSplinters:",splinterUrls)
    return splinterUrls.map(splinter => splinterIsActive(splinter)).filter(x => x);
}



async function checkMatchManaBrawl(page) {
    const mana = await getElementText(page,"#brawl_enemy_found_page_body > div > div:nth-child(2) > div.panel > div:nth-child(3) > div.col-xs-5 > div > div > div > div > div > div")
    console.log("checkMatchManaBrawl :" , mana.trim())
    const manaValue = parseInt(mana.trim(), 10);
    return manaValue;
}

async function checkMatchRulesBrawl(page) {
    //const rules = await page.$$eval("#brawl_enemy_found_page_body > div > div:nth-child(2) > div.panel > div:nth-child(3) > div.col-xs-4 > div > div > img", el => el.map(x => x.getAttribute("data-original-title")));
    const rules = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll("#brawl_enemy_found_page_body > div > div:nth-child(2) > div.panel > div:nth-child(3) > div.col-xs-4 > div > div > img");
        items.forEach((item) => {
            results.push(item.getAttribute('data-original-title'));
        });
        return results;
    })
    console.log("checkMatchRulesBrawl :" , rules)
    return rules.map(x => x.split(':')[0]).join('|')
}

async function checkMatchActiveSplintersBrawl(page) {
    // const splinters = await page.$$eval("#brawl_enemy_found_page_body > div > div > div.panel > div > div.col-xs-3 > div > div > img",
    //     el => el.map(x => x.getAttribute("data-original-title")));
    // console.log("checkMatchActiveSplintersBrawl :" , splinters.length)
    const splinters = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll("#brawl_enemy_found_page_body > div > div > div.panel > div > div.col-xs-3 > div > div > img");
        items.forEach((item) => {
            results.push(item.getAttribute('data-original-title'));
        });
        return results;
    })

    return splinters.map(x => {
        console.log("checkMatchActiveSplintersBrawl :" , x)
        const arr = x.split(':')
        if("Inactive" == arr[1]){
            return ""
        } else {
            return arr[0].trim().toLowerCase()
        }
    }).filter(x => x );
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

        console.log("checkMatchEnemy v2 ...recent_team:",recent_team.length)
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
exports.checkMatchRulesBrawl =checkMatchRulesBrawl;
exports.checkMatchManaBrawl = checkMatchManaBrawl;
exports.checkMatchActiveSplintersBrawl = checkMatchActiveSplintersBrawl;
