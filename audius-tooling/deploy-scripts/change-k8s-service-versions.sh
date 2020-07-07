set -e

source ../setup-scripts/config/conf.sh
source ./utils.sh

# Inputs
# $1 -- new tag
# $2 -- old tag

# Validations
if [ "$1" == "" ] || [ "$2" == "" ]; then
  echo "One or both tagnames are invalid: new -- $1 old -- $2";
  echo "Example usage: sh change-service-version.sh 0.3.6 0.3.5";
  exit 1;
fi

echo $1 -- new tagname
echo $2 -- old tagname

PROTOCOL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git rev-parse HEAD)
if [[ "$PROTOCOL_BRANCH" != "master" ]]; then
  echo 'Not on master branch! On' $PROTOCOL_BRANCH;
  exit 1;
fi

# check if master branch is up to date
if git merge-base --is-ancestor origin/master master; then
    echo 'Master branch is up to date!'
else
    echo 'Master branch is not up to date!';
    exit 1;
fi

# Step 1  - go to k8s repo
go_to_k8s_repo

# Step 2 - replace old version with new version

# meant for OS X, may need to be tweaked to run on Linux
# replace old version with new version in the helm/ folder
find helm -type f -exec sed -i "" "s/$2/$1/g" {} \;

git add -u helm/charts/

# Step 3 - Commit and wait for push to master
git commit -m "Bump to version $1"

# You need to manually push to github. Script waits for confirmation
read -p "Please push the version bump to Github. Did it get pushed successfully? (y/n)?" choice
case "$choice" in 
  y|Y|yes ) echo "Moving on to next step";;
  n|N|no ) echo "Exiting"; exit 1;;
  * ) echo "invalid"; exit 1;;
esac

# Step 4 - template the public k8s manifests
./ops/scripts/template.sh

# Step 5 - go to audius-k8s-manifests and copy the templates over
cd ../audius-k8s-manifests/

git pull origin master

cp -r ../audius-k8s/kube/ ./audius

# Step 6 - create a new branch and commit the changes
git checkout -b dm-v$1

git add -u .

git commit -m "Bump to version $1"

# Step 7 - wait for push to branch and PR merge
# You need to manually push to github and merge the PR. Script waits for confirmation
read -p "Please push the version bump to Github and merge the PR. Did it get pushed AND merged successfully? (y/n)?" choice
case "$choice" in 
  y|Y|yes ) echo "Moving on to next step";;
  n|N|no ) echo "Exiting"; exit 1;;
  * ) echo "invalid"; exit 1;;
esac

# Step 8 - update master
git checkout master

git pull origin master