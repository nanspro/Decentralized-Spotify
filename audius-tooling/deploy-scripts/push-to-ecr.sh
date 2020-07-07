IMAGE_URI=''

# $1 is the tag name from docker hub
# $2 is the service name
# $4 is the tag name in ECR (either 'latest' or 'production')

if [ "$1" != "" ] && [ "$2" != "" ] && [ "$3" != "" ]; then

  if [ "$2" == "identity-service" ]; then
    IMAGE_URI='526177477460.dkr.ecr.us-west-1.amazonaws.com/audius-centralized-service'

  elif [ "$2" == "creator-node" ]; then
    IMAGE_URI='526177477460.dkr.ecr.us-west-1.amazonaws.com/audius-user-metadata-node'

  else
    echo "Please pass in a valid service"
    exit 1
  fi

else
  echo "Correct usage: sh push-to-ecr.sh <tag name> <service name (identity-service, creator-node)> <latest|production>"
  exit 1
fi

# echo $1
# echo $2
# echo $IMAGE_URI
# echo $4

$(aws ecr get-login --no-include-email --region us-west-1)
docker pull audius/$2:$1
docker tag audius/$2:$1 $IMAGE_URI:$3
docker push $IMAGE_URI:$3