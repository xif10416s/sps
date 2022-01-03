#!/bin/bash
npm --max-old-space-size=4192  start  -- --username $1  >> logs/$1/$1$2-log.txt