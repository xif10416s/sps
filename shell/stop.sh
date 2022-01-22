#!/bin/bash
echo $1
ps -ef |grep $1 | awk '{print $2}'| xargs kill -9
ps -ef | grep node