#!/bin/sh

function latestFlowIds() {
if [ "$1" == "" ] ; then
  echo "Usage: latestFlowIds since [maxresults]"
  echo "       since format n[D|H|M|S], for example 1H since last hour"  
  return;
fi;
sinceparam=$1
sinceexpr="`echo $sinceparam|sed  -e "s#D# days ago#" -e "s#H# hours ago#" -e "s#M# mins ago#" -e "s#S# seconds ago#"`"
if [ "$2" != "" ] ; then
  maxresults="$2"
else
  maxresults="1"
fi;

SERVER="http://peaston-ba-lab-ams/lgserver"
LOOKUPSERVLETPATH="ui/transactionlookup.jsrv"

now=`date +%Y-%m-%d%%20%H:%M:%S`
from=`date -d "$sinceexpr" +%Y-%m-%d%%20%H:%M:%S`
testfrom=2016-02-11%2018:39:31
URL="$SERVER/$LOOKUPSERVLETPATH"
curl -s -S -X GET -u admin:security "$URL?from=$from&to=$now&maxresults=$maxresults" > .raw
cat .raw | tr "{" "\n" | grep flowId  | cut -d, -f6 | cut -d: -f  2 | cut -d'"' -f 2 
}

function latestFlow() {
if [ "$2" == "" ] ; then
  echo "Usage: latestFlow since identifier"
  echo "       since format n[D|H|M|S], for example 1H since last hour"  
  echo "       identifier used to generate unique .json file"  
  return;
fi;
sinceparam=$1
identifier=$2

SERVER="http://peaston-ba-lab-ams/lgserver"
LOOKUPSERVLETPATH="portal/operations/sequencedata.jsrv"
URL="$SERVER/$LOOKUPSERVLETPATH"

flow=`latestFlowIds $sinceparam 1`
curl -s -S -X GET  -H "Accept: application/json" -u admin:security "$URL?domain=$flow" > .t
# cut out the surrounding ( and ) characters
cat .t | cut -b2-  | sed s#.\$## > $identifier.json


}
