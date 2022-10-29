#!/bin/bash
process=$(ps -ef  | grep battlesGetDataRawV2.js  | wc -l)
if [ ${process} -le 1 ]; then
   cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  /usr/local/bin/node  battlesGetDataRawV2.js   >> /mnt/d/source/python/spsAuto/splinterlands-bot/logs/log_collet.log
fi