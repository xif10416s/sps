require('dotenv').config();
const config = require('./config/config');
const username = process.argv[process.argv.indexOf('--username') + 1]
console.log("config username :", username)
config.doConfigInit(username)

const {run, setupAccount} = require('./index');

async function startSingle() {
  let account = process.env.ACCOUNT.split('@')[0]; // split @ to prevent email use
  let password = process.env.PASSWORD;

  if (account.includes(',')) {
    console.error(
        'There is a comma in your account name. Are you trying to run multiple account?')
    console.error(
        'If yes, then you need to set MULTI_ACCOUNT=true in the .env file.')
    throw new Error('Invalid account value.')
  }

  setupAccount(account, password);
  await run();
}

//  main enter start
(async () => {

  //  check if error status
  let statusJson = require('./config/status')
  if (statusJson[process.env.ACCOUNT]) {
    console.log(`too many error stop !!!!================================`,
        statusJson)
    return;
  }

  //  start running
  console.log('Running mode: single')
  await startSingle();

})()