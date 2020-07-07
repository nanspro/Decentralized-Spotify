const assert = require('assert')
const execCommand = require('./util')

describe('build/run individual services', () => {
  /** BUILDING/RUNNING INDIVIDUAL SERVICES */
  before('SETUP: should tear all services down properly', async () => {
    await execCommand('npm run all-down', true)
    assert.ok(true)
  })

  it('should individually build contracts properly', async () => {
    try {
      await execCommand('npm run contracts-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build eth-contracts properly', async () => {
    try {
      await execCommand('npm run eth-contracts-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build ipfs properly', async () => {
    try {
      await execCommand('npm run ipfs-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build ipfs-2 properly', async () => {
    try {
      await execCommand('npm run ipfs-2-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually run init-contracts-info properly', async () => {
    try {
      await execCommand('npm run init-contracts-info-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually run init-token-versions properly', async () => {
    try {
      await execCommand('npm run init-token-versions-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build discovery-provider properly', async () => {
    try {
      await execCommand('npm run discovery-provider-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build creator-node properly', async () => {
    try {
      await execCommand('npm run creator-node-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build creator-node-2 properly', async () => {
    try {
      await execCommand('npm run creator-node-2-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })

  it('should individually build identity-service properly', async () => {
    try {
      await execCommand('npm run identity-service-up')
      assert.ok(true)
    } catch (e) {
      assert.fail(e)
    }
  })
})
