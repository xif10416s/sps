// const fs = require('fs');
// let statusJson = require('./config/status')
// statusJson['xx'] = true
// fs.writeFile(`./config/status.json`, JSON.stringify(statusJson), function (err) {
//   if (err) {
//     console.log(err);
//   }
// });

let statusJson = require('./config/status')
console.log(statusJson['xx'] )