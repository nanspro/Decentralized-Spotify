const { exec } = require('child_process')
const config = require('../config/config.js')
const serviceCommands = require('./commands/service-commands.json')
const axios = require('axios').default
const _ = require('lodash')

// Constants

// Path to audius-protocol
const PROTOCOL_DIR = config.get('protocol_dir')

// `cd` command to audius-protocol
const CD_PROTOCOL_DIR_COMMAND = `cd ${PROTOCOL_DIR};`

// Helpers

/** Executes shell command in audius protocol directory, and logs the stdout and stderr streams.
 * If the shell command exits with a non-zero status code, reject the promise.
 *
 * Upon success, resolve the promise with stdout.
 */
const execShellCommand = (command, service, { verbose }) => {
  return new Promise((resolve, reject) => {
    // Increase the max buffer to 1024*1024 bytes = ~1MB
    if (service !== 'STOPPING ANY PRE-EXISTING SERVICES') {
      command = `${CD_PROTOCOL_DIR_COMMAND} ${command}`
    }

    const proc = exec(command, { maxBuffer: 1024 * 1024 })

    // Stream the stdout
    proc.stdout.on('data', data => {
      verbose && process.stdout.write(`${data}`)
    })

    // Stream the stderr
    proc.stderr.on('data', data => {
      process.stdout.write(`${data}`)
    })

    // Upon completion, handle as necessary if any errors occur
    // Do additional error checking for health checks
    proc.on('close', exitCode => {
      // Running `make stop` when no containers are up exits with a non-zero exit code
      // Ignore that error if occurs (could be better message)
      if (exitCode !== 0 && service !== 'STOPPING ANY PRE-EXISTING SERVICES') {
        reject(
          new Error(`${service} failed to start for the command: ${command}`)
        )
        return
      }

      resolve()
    })
  })
}

/**
 * Wrapper method to execute an array of commands in sequence.
 * @param {*} commands array of commands to be executed
 * @param {*} service name of service
 * @param {*} options
 */
const execShellCommands = async (commands, service, { verbose }) => {
  try {
    for (const command of commands) {
      await execShellCommand(command, service, { verbose })
    }
  } catch (e) {
    throw new Error(`${service} failed to start`, 'error')
  }
}

// API

/**
 * SetupCommand enum.
 */
const SetupCommand = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  REGISTER: 'register'
})

/**
 * Services enum.
 *
 * For now, these services just map to the existing
 * services in the service-commands.json (creator-node-1, creator-node-2, etc).
 * In the near future these will just be a base service (creator-node),
 * and some config (ports, etc)
 */
const Service = Object.freeze({
  ALL: 'all',
  NETWORK: 'network',
  CONTRACTS: 'contracts',
  ETH_CONTRACTS: 'eth-contracts',
  IPFS: 'ipfs',
  IPFS_2: 'ipfs-2',
  IPFS_3: 'ipfs-3',
  IPFS_4: 'ipfs-4',
  INIT_CONTRACTS_INFO: 'init-contracts-info',
  INIT_TOKEN_VERSIONS: 'init-token-versions',
  DISCOVERY_PROVIDER: 'discovery-provider',
  CONTENT_SERVICE: 'content-service',
  CREATOR_NODE: 'creator-node',
  IDENTITY_SERVICE: 'identity-service',
  DISTRIBUTE: 'distribute'
})

// gets a service command, interpolating service names
const getServiceCommands = (service, serviceNumber) => {
  const commands = serviceCommands[service]
  if (!serviceNumber) {
    return commands
  } 
  const interpolated = Object.keys(commands).reduce((acc, cur) => {
    // If it's an array of commands, try interpolating
    let val = commands[cur]
    if (Array.isArray(val)) {
      val = val.map(command => command.replace("#", serviceNumber))
    } 
    return {
      ...acc,
      [cur]: val
    }
  }, {})
  return interpolated
}

/**
 * Run a command against a particular service.
 * @param {*} service
 * @param {*} setupCommand
 * @param {*} options
 */
const runSetupCommand = async (
  service,
  setupCommand,
  { serviceNumber, verbose } = { verbose: true }
) => {
  const commands = getServiceCommands(service, serviceNumber)
  if (!commands) {
    throw new Error(`No service [${service}]`)
  }
  const command = commands[setupCommand]
  if (!command) {
    throw new Error(
      `No valid setupCommand [${setupCommand}] for service [${service}]`
    )
  }

  try {
    await execShellCommands(command, service, { verbose })
  } catch (err) {
    console.error(`Got error: [${err}]`)
    throw err
  }
}

const HEALTH_CHECK_ENDPOINT = 'health_check'

/**
 * Perform a health-check for a service.
 * @param {*} service
 */
const performHealthCheck = async service => {
  // TODO: In future, extract this config so it no longer lives in
  // service commands.
  const commands = serviceCommands[service]
  if (!commands) {
    throw new Error(`Invalid service: [${service}]`)
  }
  const { protocol, host, port } = commands
  const url = `${protocol}://${host}:${port}/${HEALTH_CHECK_ENDPOINT}`

  try {
    const resp = await axios({ method: 'get', url })
    return resp
  } catch (e) {
    console.error(
      `Failed health check for service: ${service}, err: [${e.message}]`
    )
    throw e
  }
}

/**
 * Brings up an entire Audius Protocol stack.
 * @param {*} config. currently supports up to 4 Creator Nodes.
 */
const allUp = async ({ numCreatorNodes = 4 }) => {
  const options = { verbose: true }

  const inParallel = [
    [Service.IPFS, SetupCommand.UP, options],
    [Service.IPFS_2, SetupCommand.UP, options],
    [Service.CONTRACTS, SetupCommand.UP, options],
    [Service.ETH_CONTRACTS, SetupCommand.UP, options]
  ]

  const creatorNodeCommands = _.range(1, numCreatorNodes + 1).reduce((acc, cur) => {
    return [
      ...acc,
      [Service.CREATOR_NODE, SetupCommand.UP, { ...options, serviceNumber: cur }],
      [Service.CREATOR_NODE, SetupCommand.REGISTER, { ...options, serviceNumber: cur }],
    ]
  }, [])

  const sequential = [
    [Service.INIT_CONTRACTS_INFO, SetupCommand.UP],
    [Service.INIT_TOKEN_VERSIONS, SetupCommand.UP],
    [Service.DISTRIBUTE, SetupCommand.UP],
    [Service.DISCOVERY_PROVIDER, SetupCommand.UP],
    [Service.DISCOVERY_PROVIDER, SetupCommand.REGISTER],
    ...creatorNodeCommands,
    [Service.IDENTITY_SERVICE, SetupCommand.UP]
  ]

  // Start up the docker network `audius_dev`
  await runSetupCommand(Service.NETWORK, SetupCommand.UP)

  // Run parallel ops
  await Promise.all(
    inParallel.map(s => runSetupCommand(...s))
  )

  // Run sequential ops
  for (const s of sequential) {
    await runSetupCommand(...s)
  }
}

module.exports = {
  runSetupCommand,
  performHealthCheck,
  allUp,
  SetupCommand,
  Service
}
