function doConfigInit(username ){
  const userConfig = require("./"+username+".json")
  process.env.ACCOUNT = userConfig['name']
  process.env.PASSWORD = userConfig['password']
  process.env.wsport = userConfig['port']
  process.env.skip_cs = userConfig['skip_cs']
  console.log(process.env.ACCOUNT , process.env.PASSWORD , process.env.wsport,process.env.skip_cs)
}

module.exports.doConfigInit = doConfigInit;