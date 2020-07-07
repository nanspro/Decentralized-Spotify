const convict = require('convict')
const path = require('path')
require('dotenv').config({ path: './config/conf.sh' })

const config = convict({
  protocol_dir: {
    default: '~/Documents/Audius/audius-protocol',
    env: 'PROTOCOL_DIR'
  },
  health_check_wait_ms: {
    default: 15000,
    env: 'HEALTH_CHECK_WAIT_MS'
  },
  max_retries: {
    default: 10,
    env: 'MAX_RETRIES'
  }
})
config.loadFile(path.join('./config', 'setup-config.json'))

module.exports = config
