source ../setup-scripts/config/conf.sh

TOOLING_DIR=$(pwd)

check_if_on_master_and_up_to_date () {
  go_to_protocol_repo
  # check if on master branch
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
}

go_to_protocol_repo () {
  cd $PROTOCOL_DIR/
}

# assuming they're in folders side by side
go_to_k8s_repo () {
  cd $PROTOCOL_DIR/../audius-k8s/
}

go_to_tooling_repo () {
  cd $TOOLING_DIR
}