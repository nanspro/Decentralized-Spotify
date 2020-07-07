source ../setup-scripts/config/conf.sh

# $1 is the service
# $2 is start commit or tag
# $3 is end commit or tag

# example use
# `sh release-version-diff.sh discovery-provider 0.3.3 master`

if [ "$1" != "" ] && [ "$2" != "" ] && [ "$3" != "" ]; then
  if [ "$1" == "discovery-provider" ] || [ "$1" == "creator-node" ]; then
    SERVICE=$1
  else
    echo "Please pass in a valid service"
    exit 1;
  fi
else
  echo "Correct usage: sh release-version-diff.sh <service name (discovery-provider | creator-node)> <start commit or tag> <end tag>"
  exit 1;
fi

cd $PROTOCOL_DIR/;
START_COMMIT=$(git show-ref refs/tags/@audius/$SERVICE@$2 | awk '{ print $1 }')
END_COMMIT=$(git show-ref refs/tags/@audius/$SERVICE@$3 | awk '{ print $1 }')
echo $START_COMMIT, $END_COMMIT
OUTPUT=`git log --pretty=format:'[%h] - %s' --abbrev-commit $START_COMMIT..$END_COMMIT $1 | cat;`
echo "$OUTPUT" 
