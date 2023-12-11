const fetch = require("node-fetch");
const basicCards = require('./data/basicCards'); //phantom cards available for the players but not visible in the api endpoint
const cardsDetail = require('./data/cardsDetails');

getPlayerCards = (username) => (fetch(`https://api2.splinterlands.com/cards/collection/${username}?v=1640405878837&username=${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x && x.json())
  .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to === null || x.delegated_to === username).map(card => [card.card_detail_id,card.level]) : '')
  .then(advanced => advanced)
  .catch(e=> {
    console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ');
    // fetch(`https://api.splinterlands.io/cards/collection/${username}`,
    //   { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
    //   .then(x => x && x.json())
    //   .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to === null || x.delegated_to === username).map(card => card.card_detail_id) : '')
    //   .then(advanced => basicCards.concat(advanced))
    //   .catch(e => {
    //     console.log('Using only basic cards due to error when getting user collection from splinterlands: ',e);
    //     return basicCards
    //   })
    return null;
  })
)

async function  getPlayerCardsV2(username) {
  let idMap = {}
  let a= await getPlayerCards(username)
  if(a == null ){
    a= await getPlayerCards(username)
  }

  console.log("getPlayerCardsV2:", a.length)
  a= a.concat(basicCards.map(x => [x,1]))
  console.log("getPlayerCardsV2 merge:", a.length)
  a = a.map(x => {
    const level = idMap[x[0]]
    if(level != null ){
      idMap[x[0]] = Math.max(level,x[1])
    } else {
      idMap[x[0]] = x[1]
    }
    return x[0]
  })
  a = Array.from(new Set(a))
  a = a.filter(item => !cardsDetail.guildIDs.includes(item))
  return [a,idMap]
}


getPlayerCardsOnlyOwner = (username,isGold) => (fetch(`https://api2.splinterlands.com/cards/collection/${username}?v=1640405878837&username=${username}`,
        { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
    .then(x => x && x.json())
    .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to === null || x.delegated_to === username) : '')
    .then(x => {
       if(isGold){
         return x.filter(card => card.gold == true)
       } else {
         return x
       }
    } )
    .then(x => x.map(card => [card.card_detail_id,card.level]))
    .catch(e=> {
      console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ',e);
    })
)

async function getPlayerCardsOnlyOwnerV2(username,isGold){
  let idMap = {}
  let a= await getPlayerCardsOnlyOwner(username,isGold)
  if(a == null ){
    a= await getPlayerCardsOnlyOwner(username,isGold)
  }

  console.log("getPlayerCardsOnlyOwnerV2:", a.length ,isGold)
  if(isGold){
  } else {
    a= a.concat(basicCards.map(x => [x,1]))
    console.log("getPlayerCardsOnlyOwnerV2 merge:", a.length)
  }

  a = a.map(x => {
    const level = idMap[x[0]]
    if(level != null ){
      idMap[x[0]] = Math.max(level,x[1])
    } else {
      idMap[x[0]] = x[1]
    }
    return x[0]
  })
  a = Array.from(new Set(a))
  return [a,idMap]
}

module.exports.getPlayerCardsV2 = getPlayerCardsV2;
module.exports.getPlayerCardsOnlyOwnerV2 = getPlayerCardsOnlyOwnerV2;
(async ()=>{
   const [a,idMap] = await getPlayerCardsV2("sugelafei")
   console.log(a)
   // console.log(idMap)

// const [a,idMap] = await getPlayerCardsOnlyOwnerV2("hkd1234",true)
//   console.log(a)
//   console.log(idMap)

})()

// {
//   player: 'xgq123',
//       uid: 'C3-340-CKDCLKNWWW',
//     card_detail_id: 340,
//     xp: 1,
//     gold: false,
//     edition: 3,
//     market_id: null,
//     buy_price: null,
//     market_listing_type: null,
//     market_listing_status: null,
//     market_created_date: null,
//     last_used_block: null,
//     last_used_player: null,
//     last_used_date: null,
//     last_transferred_block: null,
//     last_transferred_date: null,
//     alpha_xp: null,
//     delegated_to: null,
//     delegation_tx: null,
//     skin: null,
//     delegated_to_display_name: null,
//     display_name: null,
//     lock_days: null,
//     unlock_date: null,
//     level: 1
// },
