const fs = require('fs');

let initHistory = ()=> {
    let merge = [];
    for(var i=1; i<=8; i++){
        let history = require("./hisrory/history"+i);
        console.log(i, history.length)
        merge = merge.concat(history)
    }
    return merge;
}
let history = initHistory()
console.log("merge history :" , history.length)

let distinct = new Set()
let historyTotal = history.filter(x =>{
    if(!distinct.has(x['battle_queue_id'])){
        distinct.add(x['battle_queue_id'])
        return true;
    } else {
        return false;
    }
})

fs.writeFile(`./newHistory.json`, JSON.stringify(historyTotal), function (err) {
    if (err) {
        console.log(err);
    }
});
