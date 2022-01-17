function doConfigInit(username ){
  const userConfig = require("./"+username+".json")
  process.env.ACCOUNT = userConfig['name']
  process.env.PASSWORD = userConfig['password']
  process.env.wsport = userConfig['port']
  process.env.skip_cs = userConfig['skip_cs']
  process.env.max_cnt = userConfig['max_cnt']
  process.env.finish_quest = userConfig['finish_quest']
  process.env.MINUTES_BATTLES_INTERVAL = userConfig['MINUTES_BATTLES_INTERVAL'] ? userConfig['MINUTES_BATTLES_INTERVAL'] : process.env.MINUTES_BATTLES_INTERVAL
  console.log(process.env.ACCOUNT , process.env.PASSWORD , process.env.wsport,process.env.skip_cs)
}

module.exports.doConfigInit = doConfigInit;