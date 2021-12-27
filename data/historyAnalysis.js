// let initHistory = ()=> {
//   let merge = [];
//   for(var i=1; i<=8; i++){
//     let history = require("./hisrory/history"+i);
//     console.log(i, history.length)
//     merge = merge.concat(history)
//   }
//   return merge;
// }
// let history = initHistory()
let history = require("../data/history/newHistory");
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
    // .filter(x => x['created_date'].split("T")[0] >= '2021-11-31')

console.log(historyTotal.length, history.length - distinct.size)

function getDisitinct(array, target){
  let distinct = new Set()
  array.filter(x =>{
    if(!distinct.has(x[target])){
      distinct.add(x[target])
      return true;
    } else {
      return false;
    }
  })
  console.log(target,"  ", distinct.size)
}

getDisitinct(historyTotal,'ruleset')

// INPUT:  99 Armored Up|Earthquake [ 'fire', 'water', 'life', 'death', 'dragon' ] 107
// history.filter(x => x['ruleset'] == 'Back to Basics' && x['mana_cap'] == '13').forEach(x =>{
//   console.log(JSON.stringify(x))
// })
//
// let a = ["Tarsa ★ 1","Living Lava ★ 1","Radiated Brute ★ 1","Serpentine Spy ★ 1","Lava Spider ★ 1","Tenyii Striker ★ 1",null,"Obsidian ★ 1","Mycelic Morphoid ★ 1","Chaos Agent ★ 1","Mycelic Slipspawn ★ 1","Khmer Princess ★ 1","Goblin Psychic ★ 1",null,"Tarsa ★ 1","Living Lava ★ 1","Serpentine Spy ★ 1","Goblin Fireballer ★ 1",null,null,null,"Kelya Frendul ★ 1","Diemonshark ★ 1","Serpent of Eld ★ 1","Deeplurker ★ 1","Cruel Sethropod ★ 1",null,null,"Thaddius Brood ★ 1","Cursed Windeku ★ 1","Life Sapper ★ 1","Carrion Shade ★ 1",null,null,null]
//
// let rs = a.map(sm => {
//   if(sm){
//     let sp = sm.split('★')
//     return [sp[0].trim(),sp[1].trim()]
//   } else {
//     return ['','']
//   }
// })
// console.log(JSON.stringify(rs))


// 规则培训
var reduce = history.map(x => x['ruleset']).reduce((acc, value) => {
  // Group initialization
  if (!acc[value]) {
    acc[value] = 1;
  }
  // Grouping
  acc[value]= acc[value] + 1;
  return acc;
}, {});
//
// let entries = Object.entries(reduce);
// let sorted = entries.sort((a, b) => b[1] - a[1]);
// console.log(JSON.stringify(sorted))

// 日期倒叙
// var reduce = history.map(x => x['created_date']).reduce((acc, value) => {
//   // Group initialization
//   let day = value.split("T")[0]
//   if (!acc[day]) {
//     acc[day] = 1;
//   }
//   // Grouping
//   acc[day]= acc[day] + 1;
//   return acc;
// }, {});
//
// let entries = Object.entries(reduce);
// let sorted = entries.sort((a, b) => b[0].localeCompare(a[0]));
// console.log(JSON.stringify(sorted))


// 重复统计
// var reduce = history.map(x => x['battle_queue_id']).reduce((acc, value) => {
//   // Group initialization
//   if (!acc[value]) {
//     acc[value] = 0;
//   }
//   // Grouping
//   acc[value]= acc[value] + 1;
//   return acc;
// }, {});
//
// let entries = Object.entries(reduce);
// let sorted = entries.sort((a, b) => a[1] - b[1]);
// console.log(JSON.stringify(sorted))


// history.filter(x => x['battle_queue_id'] == 'sl_f039b6fd9f54955e7b7d7ae79324a132' ).forEach(x => console.log(x))
