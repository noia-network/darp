#!/bin/bash
echo `date` compiling typescript into javascript 
rm build.??????.????
find . -name '*.pid' -delete

date>"build."`date +%y%m%d.%H%M`
ls -l "build."`date +%y%m%d.%H%M`
npm i @types/node
tsc config/config && tsc express/express && tsc pulser/pulser && tsc handlepulse/handlepulse && git add . && git commit -m "working on config and express and scripts" && git push

echo `date` Completed compiles and git push for `ls build*`
