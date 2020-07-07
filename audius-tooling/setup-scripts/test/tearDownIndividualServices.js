const assert = require('assert')
const execCommand = require('./util')

describe('tear down individual services', () => {
  /** TEARING DOWN INDIVIDUAL SERVICES */
  // This prunes the volumes
  after('TEAR DOWN: should tear all services down properly', async () => {
    await execCommand('npm run all-down', true)
    assert.ok(true)
  })

  it('should individually tear down contracts properly', async () => {
    try {
      await execCommand('npm run contracts-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down eth-contracts properly', async () => {
    try {
      await execCommand('npm run eth-contracts-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down ipfs properly', async () => {
    try {
      await execCommand('npm run ipfs-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down ipfs-2 properly', async () => {
    try {
      await execCommand('npm run ipfs-2-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down discovery-provider properly', async () => {
    try {
      await execCommand('npm run discovery-provider-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down creator-node properly', async () => {
    try {
      await execCommand('npm run creator-node-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down creator-node-2 properly', async () => {
    try {
      await execCommand('npm run creator-node-2-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually tear down identity-service properly', async () => {
    try {
      await execCommand('npm run identity-service-down')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })
})
