const cardsDetails = require("./data/cardsDetails_b_0225.json"); //saved json from api endpoint https://game-api.splinterlands.com/cards/get_details?

const makeCardId = (id) => id;

const color = (id) => {
    const card = cardsDetails.find(o => parseInt(o.id) === parseInt(id));
    const color = card && card.color ? card.color : '';
    return color;
}

exports.makeCardId = makeCardId;
exports.color = color;