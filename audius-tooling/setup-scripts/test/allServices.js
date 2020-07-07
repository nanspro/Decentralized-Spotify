/** Build, restart, and tear down all services with one command */

const assert = require('assert')
const execCommand = require('./util')

describe('build, restart, and tetar down all services with one command', () => {
  /** BUILDING ALL SERVICES */
  it('should build all services at once properly', async () => {
    try {
      await execCommand('npm run all-up', false, 2048 * 2048)
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  /** TEARING DOWN ALL SERVICES */
  it('should tear all services properly', async () => {
    try {
      await execCommand('npm run all-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })
})
