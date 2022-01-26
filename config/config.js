function doConfigInit(username ){
  delete require.cache[require.resolve("./"+username+".json")]
  const userConfig = require("./"+username+".json")
  process.env.PREFER_CS = userConfig['PREFER_CS'] ?  userConfig['PREFER_CS'] : "true"
  process.env.ACCOUNT = userConfig['name']
  process.env.PASSWORD = userConfig['password']
  process.env.wsport = userConfig['port']
  process.env.skip_cs = userConfig['skip_cs']
  process.env.max_cnt = userConfig['max_cnt']
  process.env.CLAIM_DAILY_QUEST_REWARD = userConfig['CLAIM_DAILY_QUEST_REWARD'] ? userConfig['CLAIM_DAILY_QUEST_REWARD'] : process.env.CLAIM_DAILY_QUEST_REWARD
  process.env.finish_quest = userConfig['finish_quest']
  process.env.MINUTES_BATTLES_INTERVAL = userConfig['MINUTES_BATTLES_INTERVAL'] ? userConfig['MINUTES_BATTLES_INTERVAL'] : process.env.MINUTES_BATTLES_INTERVAL
  console.log(process.env.ACCOUNT , process.env.PASSWORD ,process.env.MINUTES_BATTLES_INTERVAL,process.env.skip_cs  , process.env.max_cnt , process.env.wsport )
}

module.exports.doConfigInit = doConfigInit;