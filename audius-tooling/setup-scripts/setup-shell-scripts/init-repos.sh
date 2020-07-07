source ./config/conf.sh

set -e
set -x

cd $PROTOCOL_DIR/
git checkout $PROTOCOL_BRANCH

# setup contracts
cd $PROTOCOL_DIR/
cd contracts/
npm install &

# setup eth contracts
cd $PROTOCOL_DIR/
cd eth-contracts/
npm install &

# setup discovery provider
cd $PROTOCOL_DIR/
cd discovery-provider/

# setup creator node
cd $PROTOCOL_DIR/
cd creator-node/
npm install &
npm install & #why does it not work without this?

# setup shared libs
cd $PROTOCOL_DIR/
cd libs/
npm install &

# setup identity service
cd $PROTOCOL_DIR/
cd identity-service/
cp docker-compose/development.env docker-compose/.development.env
npm install --dev &

wait
