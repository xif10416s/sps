function doConfigInit(username ){
  const userConfig = require("./"+username+".json")
  process.env.ACCOUNT = userConfig['name']
  process.env.PASSWORD = userConfig['password']
  process.env.wsport = userConfig['port']
  console.log(process.env.ACCOUNT , process.env.PASSWORD , process.env.wsport)
}

module.exports.doConfigInit = doConfigInit;