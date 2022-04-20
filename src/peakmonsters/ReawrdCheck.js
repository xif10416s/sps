//'use strict';
const puppeteer = require('puppeteer');
let statJson = require('../../data/log/stat')
const fs = require('fs');
let puppeteer_options = {
  browserWSEndpoint: 'ws://192.168.99.100:13000',
  headless: true, // default is true
  args: ['--no-sandbox',
    '--disable-setuid-sandbox',
    '--proxy-server=192.168.99.1:1081',
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

let rsArr = []

async function doCheck() {
  const browser = await puppeteer.connect(puppeteer_options);
  //const page = await browser.newPage();
  let [page] = await browser.pages();
  await page.setDefaultNavigationTimeout(600000);
  // const useProxy = require('puppeteer-page-proxy');
  // await useProxy(page, 'http://127.0.0.1:1081');


  console.log("-----setUserAgent------")
  await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
  console.log("-----setViewport------")
  await page.setViewport({
    width: 1800,
    height: 1600,
    deviceScaleFactor: 1,
  });
  console.log("-----goto---peakmonsters---")
  await page.goto('https://peakmonsters.com/');//https://splinterlands.com/
  await page.waitForNavigation();
  console.log("------1-----")

  await page.waitForSelector("#app > div.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible > div > div.sweet-buttons > div > button",
      {visible: true, timeout: 600000})
  .then(() =>{
    page.click("#app > div.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible > div > div.sweet-buttons > div > button")
  })

  console.log("-----2------")


  const configPath = "../../config/" + statJson["users"][0] + ".json"
  console.log(configPath)
  const userConfig = require(configPath)
  const account = userConfig['name']
  const password = userConfig['password']
  await page.waitForSelector(
      '#navbar-mobile > div > ul > li:nth-child(3) > a',
      {visible: true, timeout: 60000})
  await page.$eval('#navbar-mobile > div > ul > li:nth-child(3) > a',
      elem => elem.click())

  await page.waitForSelector(
      '#app > div.navbar.navbar-default.navbar-sm.header-highlight.navbar-fixed-top > div.login-modal.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible.blocking > div > div.sweet-content > div > table > tr:nth-child(4) > td:nth-child(2) > div:nth-child(1) > input').then(
      () => page.waitForTimeout(5000))
  .then(() => page.focus(
      '#app > div.navbar.navbar-default.navbar-sm.header-highlight.navbar-fixed-top > div.login-modal.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible.blocking > div > div.sweet-content > div > table > tr:nth-child(4) > td:nth-child(2) > div:nth-child(1) > input'))
  .then(() => page.type(
      '#app > div.navbar.navbar-default.navbar-sm.header-highlight.navbar-fixed-top > div.login-modal.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible.blocking > div > div.sweet-content > div > table > tr:nth-child(4) > td:nth-child(2) > div:nth-child(1) > input',
      account))
  .then(() => page.focus(
      '#app > div.navbar.navbar-default.navbar-sm.header-highlight.navbar-fixed-top > div.login-modal.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible.blocking > div > div.sweet-content > div > table > tr:nth-child(4) > td:nth-child(2) > div:nth-child(2) > input'))
  .then(() => page.type(
      '#app > div.navbar.navbar-default.navbar-sm.header-highlight.navbar-fixed-top > div.login-modal.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible.blocking > div > div.sweet-content > div > table > tr:nth-child(4) > td:nth-child(2) > div:nth-child(2) > input',
      password))
  .then(() => {
    page.click(
        '#app > div.navbar.navbar-default.navbar-sm.header-highlight.navbar-fixed-top > div.login-modal.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible.blocking > div > div.sweet-content > div > table > tr:nth-child(4) > td:nth-child(2) > button')
  })
  .then(() => page.waitForTimeout(15000))

  console.log("----login in-------")
  let htmlStr = ""
  for (let i = 0; i < statJson["users"].length; i++) {
    const configPath = "../../config/" + statJson["users"][i] + ".json"
    console.log(configPath)
    const userConfig = require(configPath)
    const account = userConfig['name']
    const password = userConfig['password']
    console.log("account start ....", account, password)


    const cardsUrl = 'https://peakmonsters.com/@' + account + '/explorer';
    console.log(cardsUrl)
    await page.goto(cardsUrl);
    console.log("-----------nav start---------")
    await page.waitForNavigation({timeout:60000}).then(()=>{}).catch((e) =>{
      console.log("nav time out......")
    });
    console.log("-----------nav end---------")
    const rewardFilterSelector = "#app > div.page-container > div > div > div.content > div > div.col-md-2.col-md-push-9 > div > div > div > div > div.category-content.no-padding > ul > li:nth-child(14) > a > div > input[type=checkbox]"
    await page.waitForSelector(
        rewardFilterSelector,
        {visible: true, timeout: 300000})
    .then(() => {
      page.click(
          rewardFilterSelector)
    })
    .then(() => {
      page.click("#app > div.page-container > div > div > div.content > div > div.col-md-6.col-md-offset-1 > div > div.panel-body > ul > li:nth-child(13) > div > div.media-body > a:nth-child(2)")
    })
    .catch((e) => {
      console.log(e)
    })
    console.log("-----------filter end---------")

    async function collectData(index) {
      const html = await page.evaluate((index) => {
        const h1 = document.querySelector(
            "#app > div.page-container > div > div > div.content > div > div.col-md-6.col-md-offset-1 > div > div.panel-body > ul > li:nth-child("+index+")").textContent
        if(h1.indexOf("Rewards") != -1){
          return  document.querySelector(
              "#app > div.page-container > div > div > div.content > div > div.col-md-6.col-md-offset-1 > div > div.panel-body > ul > li:nth-child("+index+")").outerHTML
        }
        return null;
      }, index);
      return html;
    }
    for (let i = 1; i <= 30; i++) {
      const htStr = await collectData(i);
      if(htStr != null ) {
        htmlStr += htStr;
        break;
      }
    }

    console.log("account end ....", account)
  }

  fs.writeFile(`./logs/claims.txt`,
      htmlStr, function (err) {
        if (err) {
          console.log(err);
        }
  });

  await page.close();
  await browser.close();

  console.log("--------check end------")
}

async function doPKCheck(account, passward, page) {
  try {
    const cardsUrl = 'https://peakmonsters.com/@' + account + '/cards';
    console.log(cardsUrl)
    await page.goto(cardsUrl);
    console.log("-----------nav start---------")
    await page.waitForNavigation({timeout:60000}).then(()=>{}).catch((e) =>{
      console.log("nav time out......")
    });
    console.log("-----------nav end---------")
    if(!isClosedModel) {
      await page.waitForSelector("#app > div.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible > div > div.sweet-buttons > div > button",
          {visible: true, timeout: 600000})
      .then(() =>{
        isClosedModel = true;
        page.click("#app > div.sweet-modal-overlay.theme-dark.sweet-modal-clickable.is-visible > div > div.sweet-buttons > div > button")
      })
      console.log("---close  mode -----")
    }

    await page.waitForSelector(
        "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > thead > tr > th:nth-child(10) > small > a",
        {visible: true, timeout: 300000})
    .then(() => {
      page.click(
          "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > thead > tr > th:nth-child(10) > small > a")
    }).catch((e) => {
      console.log(e)
    })
    console.log("----filtered in-------")
    await page.waitForTimeout(10000);
    console.log("----getpath-------")

    await page.waitForSelector(
        "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr:nth-child(1) > td:nth-child(10) > small",
        {timeout: 160000, visible: true}).then(() => {
    }).catch((e) => console.log(e))
    console.log("----evaluate start-------", new Date().toLocaleString())

    async function getTextBySelector(selector) {
      const element = await page.waitForSelector(selector, {timeout: 1000}).then((element) =>{return element.evaluate(el => el.textContent)}).catch((e) =>{ return null });
      // if(element) {
      //   const text = await element.evaluate(el => el.textContent);
      //   return text;
      // } else {
      //   return  null;
      // }
      // console.log(element)
      return element
    }

    async function collectData(account, rsArr, index) {
      try {
        const h1 = await getTextBySelector(
            "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr:nth-child("+index+") > td:nth-child(10) > small")
        if(h1 == null) {
          console.log(index,"finished...")
          return false;
        }
        const p1 = await getTextBySelector(
            "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr:nth-child("+index+") > td:nth-child(7) > small > span")
        const d1 = await getTextBySelector(
            "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr:nth-child("+index+") > td.text-right.smallable > div > div > small")
        const pf = parseInt(
            p1.replaceAll("'", "").replaceAll("(", "").replaceAll(")",
                "").replaceAll(",", ""))
        // console.log(pf)
        // const aNum =  parseFloat(h1.minHours.replaceAll("'","").split(" ")[0])
        // const aHour = h1.minHours.indexOf("days") != -1 ? 24 : 1 ;
        const name = await getTextBySelector("#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr:nth-child("+index+") > td.text-left.text-semibold.smallable > div > div")
        if (pf >= 100 && h1.toUpperCase().indexOf(HOURS) != -1 && rsArr.length <= 5) {
          rsArr.push({
            "account": "[" + account + "]",
            "card":name.split("\n          ")[1],
            "maxPower": pf,
            "cp/dec": d1,
            "minHours": h1,
            "time": new Date().toLocaleTimeString()
          })
        }


        if(name.indexOf("Mylor Crowling") != -1) {
          rsArr.push({
            "account": "["+account+"]",
            "card":name.split("\n          ")[1],
            "maxPower": "Mylor",
            "cp/dec" : d1,
            "minHours": h1,
            "time": new Date().toLocaleTimeString()
          })
        }
      } catch (e) {
        console.log(index,e)
        return false
      }
      return true;
    }

    let tempArr = []
    let cnt = 1;
    for (let i = 1; i <= 150; i++) {
      // console.log("-----------,",i)
      if (await collectData(account, tempArr, i)) {
        cnt++;
      } else {
        if(cnt >= 20) {
          break;
        }
      }
    }

    console.log("tempArr len:", tempArr.length)
    console.log("----evaluate end-------", new Date().toLocaleString())
    rsArr = rsArr.concat(tempArr)

    // try {
    //   // await page.reload();
    //   // await page.waitForTimeout(5000);
    //   await page.waitForSelector("#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-2.col-md-push-10 > div > div > div > div > div.category-content.no-padding > ul > li:nth-child(2) > div > div > input", {timeout: 5000})
    //   .then(()=>{
    //     page.focus("#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-2.col-md-push-10 > div > div > div > div > div.category-content.no-padding > ul > li:nth-child(2) > div > div > input")
    //   })
    //   .then(() =>{
    //     page.type(
    //         "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-2.col-md-push-10 > div > div > div > div > div.category-content.no-padding > ul > li:nth-child(2) > div > div > input",
    //         "Mylor Crowling")
    //   }).then(() =>{
    //      page.waitForTimeout(5000)
    //   }).then(() =>{
    //     page.focus(
    //         "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-2.col-md-push-10 > div > div > div > div > div.category-content.no-padding > ul > li:nth-child(3) > div > div > div > input")
    //   }).then(() =>{
    //     page.waitForTimeout(3000)
    //   })
    //
    //   const mylor = await page.evaluate((account) => {
    //     const h1 = document.querySelector(
    //         "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr > td.text-right.smallable > div > div > small").textContent
    //     const d1 = document.querySelector(
    //         "#app > div.page-container > div > div > div > div > div.row.display-flex-row > div.col-md-10.col-md-pull-2 > div > div.table-responsive > table > tbody > tr > td:nth-child(10) > small").textContent
    //     return {
    //       "account": account,
    //       "maxPower": "mylor",
    //       "cp/dec": d1,
    //       "minHours": h1,
    //       "time": new Date().toLocaleTimeString()
    //     }
    //   }, account);
    //
    //   rsArr.push(mylor)
    // } catch (e) {
    //   // console.log("mylor:", e)
    // }

    // console.log(rsArr)

    console.log("----summaryLogger end-------")

  } catch (e) {
    console.log("00000000", e)
  } finally {
    console.log("----do login out -------")
    doLog(rsArr)
    // await page.$eval(
    //     '#navbar-mobile > div > ul > li.dropdown-user.dropdown > a > i',
    //     elem => elem.click())
    // await page.waitForTimeout(5000);
    // await page.$eval(
    //     '#navbar-mobile > div > ul > li.dropdown-user.dropdown.open > ul > li:nth-child(11) > a',
    //     elem => elem.click())
    //
    // console.log("---- login out end-------")
    //
    // await page.reload();
  }
}

(async () => {
  await doCheck()
})()
