const history = require("./newHistory.json");
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

// var reduce = history.map(x => x['ruleset']).reduce((acc, value) => {
//   // Group initialization
//   if (!acc[value]) {
//     acc[value] = 1;
//   }
//   // Grouping
//   acc[value]= acc[value] + 1;
//   return acc;
// }, {});
//
// let entries = Object.entries(reduce);
// let sorted = entries.sort((a, b) => b[1] - a[1]);
// console.log(JSON.stringify(sorted))


var reduce = history.map(x => x['created_date']).reduce((acc, value) => {
  // Group initialization
  let day = value.split("T")[0]
  if (!acc[day]) {
    acc[day] = 1;
  }
  // Grouping
  acc[day]= acc[day] + 1;
  return acc;
}, {});

let entries = Object.entries(reduce);
let sorted = entries.sort((a, b) => b[0].localeCompare(a[0]));
console.log(JSON.stringify(sorted))