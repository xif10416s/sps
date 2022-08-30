# splinterlands-bot

This is my personal project of a BOT to play the game [Splinterlands](https://www.splinterlands.com). It requires [NodeJs](https://nodejs.org/it/download/) installed to run.


## How to start the BOT:

REQUIREMENT: You need to install NodeJS from https://nodejs.org/en/download/ (at least the last stable version 14.18.0)

Once NodeJS is installed and you downloaded the bot in a specific folder, you need to set your configuration in the .env file:

you need to create the .env file and include the username and posting key (file with no name, only starting dot to create a hidden file) in the bot folder, 

Example: 

- `ACCOUNT=youraccountname`
- `PASSWORD=yourpostingkey`

You can also use the file `.env-example` as a template, but remember to remove `-example` from the filename.

__IMPORTANT:__ the bot needs the __username and posting key__ in order to login. __Don't use the email and password__. If you don't have the posting key, you need to _'Request Keys'_ from the top right menu in Splinterlands. You will receive a link to follow where you will get your Hive private keys. __Store them safely and don't share them with anyone!__  

Once the file is created, open cmd (for windows) or terminal (for Mac and Linux) and run:

`npm install`

and then

`npm start`

There is also a youtube video made by a user that can help windows users with the setup [here](https://youtu.be/MFxV6XeDKec)


If you face issue related to the browser when you run the bot for the first time, be sure you have installed chromium browser. For Linux:
#### install chromium
sudo apt-get install chromium-browser

#### run this if running chromium still fails
sudo apt-get install libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libgconf2-4 libasound2 libatk1.0-0 libgtk-3-0 libgbm-dev



### Optional variables:

The BOT will make a battle every 30 minutes by default, you can change the custom value specifying in the .env the variable `MINUTES_BATTLES_INTERVAL`.
The BOT will also try to select team to complete the daily quest by default. If you want to remove this option to increase the winning rate, you can set the variable `QUEST_PRIORITY` as false.
By default, the BOT doesn't check for season rewards but it can automatically click on the seasons reward claim button if available and the `CLAIM_SEASON_REWARD` is set to true. The default option is false.
By default, the BOT checks automatically for daily quest rewards but the claim option can be deactivated with the option `CLAIM_DAILY_QUEST_REWARD` is set to false. The default option is true.
By default, the BOT will run as headless. Set `HEADLESS` to false to see your browser. The default option is true
By default, the BOT will run no matter the ECR level. Set `ECR_STOP_LIMIT` to a specific value you want the bot to rest and recover the ECR. The bot will recover until the `ECR_RECOVER_TO` is reached or until 100% ECR.
If you want the bot to play only one color (when it's possible), use the variable `FAVOURITE_DECK`  and specify the splinter by choosing only one among: fire, life, earth, water, death, dragon. 
If you want the bot to try to skip specific quest types you can include multiple quest in the variable `SKIP_QUEST` separated by the comma (`SKIP_QUEST=life,snipe,neutral`). whenever it's possible, the bot will click to ask for a new one. Remember you can only ask for a new one once based on the game rules.

Example:

- `QUEST_PRIORITY=false`

- `MINUTES_BATTLES_INTERVAL=30`

- `CLAIM_SEASON_REWARD=true`

- `CLAIM_DAILY_QUEST_REWARD=false`

- `HEADLESS=false`

- `ECR_STOP_LIMIT=50`

- `ECR_RECOVER_TO=99`

- `FAVOURITE_DECK=dragon`

- `SKIP_QUEST=life,snipe,neutral`

### Running bot with multiaccount setting

in order to run multple accounts launching the script only once, you can simply add the list of usernames and posting keys in the .env file and set the variable `MULTI_ACCOUNT` as true:

- `MULTI_ACCOUNT=true`
- `ACCOUNT=user1,user2,user,...`
- `PASSWORD=postingkey1,postingkey2,postingkey3,...`

### Running bot as a daemon with PM2

To run your bot as a daemon (background process) you can use NPM package PM2. PM2 is daemon process manager, that works on Linux, MacOS, and Windows. To install PM2 globally, you need to run:

# `npm install pm2 -g`

To start a bot, do all the preparation steps from the above, but instead of `npm start`, run this:

`pm2 start main.js`

You can now run `pm2 list` command to see your bot up and running. It will automatically start on system startup now. You can control the bot with these commands:

`pm2 start <id>`

`pm2 stop <id>`

`pm2 restart <id>`

`pm2 delete <id>`

You can find more information on PM2 usage options at their [official webiste](https://pm2.keymetrics.io/).


### Running the bot in a docker container

docker instructions:

1. first, you need to install docker https://docs.docker.com/get-docker/
2. open your terminal/command line
3. cd into your bot directory
4. build the image
-> `docker build -t your_image_name -f Dockerfile .`
5. then run a container based on the image
-> `docker run -it your_image_name bash`
6. the 5th step will get you inside your container, use nano or vim to edit your .env file and make sure to uncomment CHROME_EXEC
7. finally, run
-> `npm start`



## Local History backup (battlesGetData.js)

The BOT leverages an API on a free server but in case the traffic is heavy or it doesn't work, it is possible to have locally an history as a backup solution that the bot will read automatically.
To generate the file 'history.json' with a unique array with the history of the battles of an array of users specified in the file.

[ OPTIONAL ] run this command from the terminal:

`node battlesGetData.js`

Once the script is done, it will create a file 'history.json' in the data folder. To makes the bot using it, you have to rename it in: 'newHistory.json' 

**How to get history data from users of my choice?**

1. Open battlesGetData.js in notepad and change the usersToGrab on line 69 to the users of your choice
2. Run `node battlesGetData.js` in the bot folder
3. File history.json is created, rename it to newHistory.json to replace the existing history data OR extend the newHistory.json file (see below)

**How to extend the newHistory.json without deleting existing data?**

1. Backup newHistory.json in case something goes wrong
2. Inside the data folder, run `node combine.js` in the data folder to add the data from history.json to the newHistory.json file


# FAQ


Q: Can I make the bot running a battle every 2 minutes?
A: Technically yes, but playing too often will decrease the Capture Rate making the rewards very low and insignificant. Try to play a battle every 20 minutes MAX to maintain high level of rewards. Trust me, you keep the ROI higher. Don't be greedy.

Q: Does it play for the daily quest?
A: At the moment the bot consider only the splinters quests (death, dragon, earth, fire, life, water) but not the special one (snipe, sneak, neutral,...). Therefore yes, the bot prioritize the splinter for the quest. Nonetheless if the bot consider more probable to win a battle with another splinter (because for example there are not many possible team for the splinter of the quest), you may see a different card selection sometimes

Q: Can I play multiple accounts?
A: Technically yes, but don't be greedy.

Q: I got the error "cannot read property split of undefined"
A: check that the credentials file doesn't contain any but ".env" in the name. (no .txt or anything else) and check that there is nothing but ACCOUNT=yourusername and PASSWORD=yourpass in 2 lines with no spaces. Also you must use the username with the posting key, and not the email address.

Q: Why the bot doesn't use my best card I paid 1000$?
A: Because the bot select cards based on the statistics of the previous battles choosing the most winning team for your cards. it's a bot, not a thinking human being!

Q: Why the bot doesn't use the Furious Chicken?
A: same as above


# Donations

I've created using my personal free time so if you like it or you benefit from it and would like to be grateful and offer me a beer 🍺 I'll appreciate:

- DEC into the game to the player **splinterlava** 
- Bitcoin bc1qpluvvtty822dsvfza4en9d3q3sl5yhj2qa2dtn
- Ethereum 0x8FA3414DC2a2F886e303421D07bda5Ef45C84A3b 
- Tron TRNjqiovkkfxVSSpHSfGPQoGby1FgvcSaY
- BUSD(ERC20) 0xE4B06BE863fD9bcE1dA30433151662Ea0ecA4a7e

Cheers!

where you can find some support from other people using it:

[Discord](
https://discord.gg/bR6cZDsFSX)

[Telegram chat](https://t.me/splinterlandsbot) 

set http_proxy=http://127.0.0.1:1081
set https_proxy=http://127.0.0.1:1081

set http_proxy=http://192.168.1.110:1081
set https_proxy=http://192.168.1.110:1081



npm start >> logs/sugelafei11-log.txt

playname:
//*[@id="dialog_container"]/div/div/div/div[2]/div[1]/div/section/div[2]/div[1]/span[2]

图片：租赁
//*[@id="mw-content-text"]/div[*]/ul[*]/li[*]/div/img/@src

自己拥有：
//*/img/@card_detail_id

sudo service cron restart
node battlesGetDataRawV1.js

// -e "MAX_QUEUE_LENGTH=300"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=200"  -e "PREBOOT_CHROME=true" -e "KEEP_ALIVE=true"
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3000:3000 -m 5g --memory-swap -1 --restart always -d --name browserless browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3001:3000 -m 5g --memory-swap -1 --restart always -d --name browserless3001 browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3002:3000 -m 6g --memory-swap -1 --restart always -d --name browserless3002 browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3003:3000 -m 6g --memory-swap -1 --restart always -d --name browserless3003 browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3004:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3004 browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3005:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3005 browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3006:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3006 browserless/chrome
docker run -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3007:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3007 browserless/chrome

// proxy --
docker run  --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3000:3000 -m 1g --memory-swap -1 --restart always -d --name browserless browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3001:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3001 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3002:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3002 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3003:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3003 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3004:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3004 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3005:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3005 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3006:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3006 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3007:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3007 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3008:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3008 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"  -e "MAX_QUEUE_LENGTH=1"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=1"    -p 3009:3000 -m 1g --memory-swap -1 --restart always -d --name browserless3009 browserless/chrome

docker run  -e "MAX_QUEUE_LENGTH=5"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=5"    -p 13000:3000 -m 4g --memory-swap -1 --restart always -d --name browserless13000 browserless/chrome
docker run --env HTTP_PROXY="http://192.168.99.1:1081" --env HTTPS_PROXY="http://192.168.99.1:1081"   -e "MAX_QUEUE_LENGTH=5"  -e "CONNECTION_TIMEOUT=90000000"  -e "MAX_CONCURRENT_SESSIONS=5"    -p 13000:3000 -m 4g --memory-swap -1 --restart always -d --name browserless13000 browserless/chrome

http://192.168.99.100:3000

//WSL
npm --max-old-space-size=5192 start >> logs/sugelafei5-log.txt


npm --max-old-space-size=4192  start  -- --username sugelafei2  >> logs/sugelafei2/sugelafei10-log.txt
npm --max-old-space-size=4192  start  -- --username sugelafei  >> logs/sugelafei/sugelafei11-log.txt

// shell
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh sugelafei 1 
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh sugelafei2 1 
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh xifei123 1  
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh xifei1234 1 
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh hkd123 1   
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh hkd1234 1 
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh xqm123 
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/start.sh xqm1234 


ps -ef |grep sugelafei2 |awk '{print $2}'|xargs kill -9

cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  ./shell/stop.sh hkd123 sugelafei2

// python
cd /mnt/d/source/python/spsAuto/splinterlands-bot/anlysis/spark && source bin/activate && source ~/.bashrc
pyspark --driver-memory 25g
cd /mnt/d/source/python/spsAuto/splinterlands-bot/anlysis/spark && jupyter notebook
cd /mnt/d/source/python/spsAuto/splinterlands-bot/anlysis/spark && source bin/activate && jupyter notebook list


// static weekly
copy source exec
/mnt/e/spark/spark-3.2.0-bin-hadoop3.2/bin/spark-shell --conf spark.local.dir=/mnt/h/temp  --master local[6] --driver-memory 4g  --name test
-----/mnt/e/spark/spark-3.2.0-bin-hadoop3.2/bin/spark-shell --conf spark.local.dir=/mnt/h/temp  --master local[10] --driver-memory 10g  --name test -i /mnt/d/source/python/spsAuto/splinterlands-bot/anlysis/scala/batSt_csv.scala


-- wsl 
net stop LxssManager
net start LxssManager

# 最新卡片信息  -- cardsDetails.json -- 
https://api2.splinterlands.com/cards/get_details

## docker start
sudo swapon -p 5 /mnt/sda1/swap/swapfile

docker stats

node --max-old-space-size=5192 src/server/WebServer.js

browserless/chrome
https://github.com/browserless/chrome
https://docs.browserless.io/docs/docker.html


## chrome debug
192.168.99.1
127.0.0.1
kill -s 9 `pgrep node`

ps aux|grep battlesGetDataRawV2|awk '{print $2}'|xargs kill -9




tail -200f /var/log/supervisor/supervisord.log

sudo find / -name supervisor.sock
unlink /run/supervisor/supervisor.sock

mysql 配置
C:\Program Files\MySQL\MySQL Server 8.0

select * into outfile 'F:p20220420.txt' Fields TERMINATED by ','  From  battle_history_raw_v2 PARTITION(p20220420);
load data infile 'F:12.csv' into table battle_stat_v5 Fields TERMINATED by ','  (startMana,endMana,cs,len,rule,summonerId,teams,totalCnt,lostTeams,lostTotalCnt)
load data infile 'F:12.csv' into table battle_stat_cs_ls_v5 Fields TERMINATED by ','  (startMana,endMana,rule, wcs,wlen, lcs,llen,count)

一，跑模型
1. 导出
1.1  node anlysis/etl/dataExport_morden.js
1.2  移动文件到：dataDir = "/mnt/f/battleData"
2. 分析
/mnt/e/spark/spark-3.2.0-bin-hadoop3.2/bin/spark-shell --conf spark.local.dir=/mnt/h/temp  --master local[6] --driver-memory 10g  --name test
2.1 batSt_csc
3  导入
3.1  重建表 &  关闭索引
SET SESSION BULK_INSERT_BUFFER_SIZE=256217728;
SET SESSION MYISAM_SORT_BUFFER_SIZE=256217728;
set global KEY_BUFFER_SIZE = 256217728 ;
alter table battle_stat_v5 DISABLE keys ;
alter table battle_stat_cs_ls_v5 DISABLE keys ;
node anlysis/etl/dataImport.js
4. 恢复所有
alter table battle_stat_v5 ENABLE keys
alter table battle_stat_cs_ls_v5 ENABLE keys

----------------
docker-machine ssh default 

win restart:
一、wsl
sudo service ssh --full-restart
sudo service cron restart 

二、supervisord
sudo supervisord -c /etc/supervisor/supervisord.conf
sudo service supervisor start
修改了被守护的进程的源码，需要重启对这个进程的守护才能生效
sudo supervisorctl start(stop,restart) program_name
sudo supervisorctl reload
sudo supervisorctl


cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/xqm123/xqm123.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/xqm1234/xqm1234.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/hkd123/hkd123.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/hkd1234/hkd1234.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/xifei123/xifei123.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/xifei1234/xifei1234.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/sugelafei/sugelafei.log
cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/sugelafei2/sugelafei2.log

 
 cd /mnt/d/source/python/spsAuto/splinterlands-bot/logs && watch -n 5  tail -n12  ---disable-inotify  Summary.txt
 cd /mnt/d/source/python/spsAuto/splinterlands-bot/logs && watch -n 5  tail -n20  ---disable-inotify  rentStat.txt
