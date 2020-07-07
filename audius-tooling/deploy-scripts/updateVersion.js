const fs = require('fs');
const path = require('path')

const AUDIUS_REPO_PATH = process.argv[process.argv.length - 2]
const NEW_VERSION = process.argv[process.argv.length - 1]

function updateJSONFile (dir) {
  const fileName = path.join(AUDIUS_REPO_PATH, dir, '.version.json');

  let versionJSON = JSON.parse(fs.readFileSync(fileName, 'utf8'))
  versionJSON.version = NEW_VERSION

  console.log(`writing file to ${fileName}\n`, JSON.stringify(versionJSON, null, 2))
  fs.writeFileSync(fileName, JSON.stringify(versionJSON, null, 2))
}

updateJSONFile('discovery-provider')
updateJSONFile('creator-node')