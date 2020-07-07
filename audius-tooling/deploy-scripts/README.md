### `deploy-scripts` Overview

The deploy scripts are helpers to deploy new versions of audius-protocol. Some helpers include bumping version.json, cutting tags and releases on github and getting the changelog between two versions

#### Overview of scripts

##### `push-to-ecr.sh`

Given that we use ECR to maintain images for identity service, this is a helper script that fetches a built image from dockerhub and pushes it to ECR.

Usage

`sh push-to-ecr.sh 1b542b0f0cc89a589655aa60c8f1de300a6fa147 identity-service production`

##### `new-protocol-release.sh`

This script atuomates a lot of the steps required to release a new version of the audius-protocol.

1. Bump .version.json in discovery-provider and creator-node
2. Commit the result if the protocol branch is up to date on master
3. Wait for confirmation that the user pushed to protocol
4. Get the changelog between the last version and the new version
5. Publish the tag and release to github with the changelog

Usage

`sh new-protocol-release.sh 0.3.7 0.3.6`


##### `release-version-diff.sh`

This script generates the changelog between two tags

Usage

`sh release-version-diff.sh creator-node 0.3.6 0.3.7`

##### `updateVersion.js`

This script bumps the version in the .version.json files in services.

Usage

`node updateVersion.js ~/Documents/Audius/audius-protocol/ 0.3.7`

