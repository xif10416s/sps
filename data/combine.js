const fs = require('fs');

const history1 = require("./history20211219.json");
const history2 = require("./newHistory_20211219.json");

const newHistory = history1.concat(history2)

fs.writeFile(`./newHistory.json`, JSON.stringify(newHistory), function (err) {
    if (err) {
        console.log(err);
    }
});
