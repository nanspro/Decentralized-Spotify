source ../setup-scripts/config/conf.sh

echo $1 -- service name
echo $2 -- tagname
echo $3 -- build sha 

if [[ "$1" =~ ^discovery-provider|creator-node|content-service|identity-service$ ]]; then
  continue
else
  echo "Must be a valid service type: 'discovery-provider', 'creator-node', 'content-service', 'identity-service'"
  exit 1
fi


if [[ "$1" == "discovery-provider" ]]; then
  echo "Starting discovery provider"
  cd $PROTOCOL_DIR/
  cd discovery-provider/

elif [[ "$1" == "creator-node" ]]; then
  echo "Starting creator node"
  cd $PROTOCOL_DIR/
  cd creator-node/

elif [[ "$1" == "content-service" ]]; then
  echo "Starting content service"
  cd $PROTOCOL_DIR/
  cd content-service/

elif [[ "$1" == "identity-service" ]]; then
  echo "Starting identity service"
  cd $PROTOCOL_DIR/
  cd identity-service/

fi

sha=$(git rev-parse HEAD)
echo $sha
docker build --build-arg git_sha=$sha -t audius/$1:$2 .
docker push audius/$1:$2
