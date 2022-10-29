//  "MAX_REWARDS": "true",
function doConfigInit(username ){
  delete require.cache[require.resolve("./"+username+".json")]
  const userConfig = require("./"+username+".json")
  process.env.PREFER_CS = userConfig['PREFER_CS'] ?  userConfig['PREFER_CS'] : "true"
  process.env.ACCOUNT = userConfig['name']
  process.env.PASSWORD = userConfig['password']
  process.env.wsport = userConfig['port']
  process.env.skip_cs = userConfig['skip_cs']
  process.env.max_cnt = userConfig['max_cnt']
  process.env.algorithm = userConfig['algorithm']
  process.env.algorithm_rating = userConfig['algorithm_rating'] ? userConfig['algorithm_rating'] : "0.3"
  process.env.MAX_REWARDS = userConfig['MAX_REWARDS'] ?  userConfig['MAX_REWARDS'] : "false"
  process.env.RANKED = userConfig['RANKED'] ? userConfig['RANKED'] : "W"
  process.env.SKIP_QUEST = userConfig['SKIP_QUEST'] ? userConfig['SKIP_QUEST'] : process.env.SKIP_QUEST
  process.env.QUEST_PRIORITY = userConfig['QUEST_PRIORITY'] ? userConfig['QUEST_PRIORITY'] : process.env.QUEST_PRIORITY
  process.env.ECR_RECOVER_TO = userConfig['ECR_RECOVER_TO'] ? userConfig['ECR_RECOVER_TO'] : process.env.ECR_RECOVER_TO
  process.env.CLAIM_DAILY_QUEST_REWARD = userConfig['CLAIM_DAILY_QUEST_REWARD'] ? userConfig['CLAIM_DAILY_QUEST_REWARD'] : process.env.CLAIM_DAILY_QUEST_REWARD
  process.env.MINUTES_BATTLES_INTERVAL = userConfig['MINUTES_BATTLES_INTERVAL'] ? userConfig['MINUTES_BATTLES_INTERVAL'] : process.env.MINUTES_BATTLES_INTERVAL
  console.log(process.env.ACCOUNT , process.env.PASSWORD ,process.env.MINUTES_BATTLES_INTERVAL,process.env.skip_cs  , process.env.max_cnt , process.env.wsport )
}

module.exports.doConfigInit = doConfigInit;