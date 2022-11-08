const fetch = require("node-fetch");
const basicCards = require('./data/basicCards'); //phantom cards available for the players but not visible in the api endpoint
const cardsDetail = require('./data/cardsDetails');

getPlayerCards = (username) => (fetch(`https://api2.splinterlands.com/cards/collection/${username}?v=1640405878837&username=${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x && x.json())
  .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to === null || x.delegated_to === username).map(card => card.card_detail_id) : '')
  .then(advanced => basicCards.concat(advanced))
  .catch(e=> {
    console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ');
    fetch(`https://api.splinterlands.io/cards/collection/${username}`,
      { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
      .then(x => x && x.json())
      .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to === null || x.delegated_to === username).map(card => card.card_detail_id) : '')
      .then(advanced => basicCards.concat(advanced))
      .catch(e => {
        console.log('Using only basic cards due to error when getting user collection from splinterlands: ',e);
        return basicCards
      })
  })
)


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
    .then(x => x.map(card => card.card_detail_id))
    .then(advanced => {
      if(isGold){
        return advanced
      } else {
        return basicCards.concat(advanced)
      }
    })
    .catch(e=> {
      console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ',e);
    })
)


module.exports.getPlayerCards = getPlayerCards;
module.exports.getPlayerCardsOnlyOwner = getPlayerCardsOnlyOwner;
// (async ()=>{
//   let a = []
//   await getPlayerCardsOnlyOwner("hkd1234",false).then(x => a.push(...x))
//   a = Array.from(new Set(a))
//   console.log(JSON.stringify(a.sort()))
// })()

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
