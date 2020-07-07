set -e

source ../setup-scripts/config/conf.sh
source ./utils.sh

# Inputs
# $1 -- new tag
# $2 -- old tag

# Validations
if [ "$AUDIUS_GITHUB_TOKEN" == "" ]; then
  echo "Please export an env var called AUDIUS_GITHUB_TOKEN";
  exit 1;
elif ["$1" == ""] || [ "$2" == "" ]; then
  echo "One or both tagnames are invalid: new -- $1 old -- $2";
  echo "Example usage: sh new-protocol-release.sh 0.3.6 0.3.5";
  exit 1;
fi

echo $1 -- new tagname
echo $2 -- old tagname

# Step 1 - Bump .version.json files
node updateVersion.js $PROTOCOL_DIR $1

check_if_on_master_and_up_to_date
git add $PROTOCOL_DIR/discovery-provider/.version.json
git add $PROTOCOL_DIR/creator-node/.version.json
git commit -m "Bump version to $1"

# You need to manually push to github. Script waits for confirmation
read -p "Please push the version bump to Github. Did it get pushed successfully? (y/n)?" choice
case "$choice" in 
  y|Y|yes ) echo "Moving on to next step";;
  n|N|no ) echo "Exiting"; exit 1;;
  * ) echo "invalid"; exit 1;;
esac

# Step 2 - Generate changelog
go_to_tooling_repo

CHANGELOG_TEMPLATE_DISCOVERY="Full Changelog:
$(sh release-version-diff.sh discovery-provider $2 master | awk 'NR>1')"

CHANGELOG_TEMPLATE_CREATOR="Full Changelog:
$(sh release-version-diff.sh creator-node $2 master | awk 'NR>1')"

# Step 3 - Publish release with ghr
check_if_on_master_and_up_to_date

# go back to tooling directory to run ghr command
go_to_tooling_repo

# Discovery Release
DISCOVERY_TAG_NAME=@audius/discovery-provider@$1
./ghr -t $AUDIUS_GITHUB_TOKEN -u AudiusProject -r audius-protocol -c $CURRENT_COMMIT -b "$CHANGELOG_TEMPLATE_DISCOVERY" -n "Discovery Provider $1" -soft $DISCOVERY_TAG_NAME

# Creator release
CREATOR_TAG_NAME=@audius/creator-node@$1
./ghr -t $AUDIUS_GITHUB_TOKEN -u AudiusProject -r audius-protocol -c $CURRENT_COMMIT -b "$CHANGELOG_TEMPLATE_CREATOR" -n "Creator Node $1" -soft $CREATOR_TAG_NAME

# Step 4 - Update helm charts + public K8s manifests
sh change-k8s-service-versions.sh $1 $2