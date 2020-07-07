const { exec } = require('child_process')
const colors = require('colors')
const config = require('./config')
const axios = require('axios')

// Setting pretty print colors
colors.setTheme({
  happy: 'rainbow',
  success: 'green',
  error: 'red'
})

// Max number of retries for any command
const MAX_RETRIES = config.get('max_retries')

// Wait time for health checks
const HEALTH_CHECK_WAIT_MS = config.get('health_check_wait_ms')

// Services that require additional health check logic
const SERVICES_WITH_HEALTH_CHECK_ENDPOINTS = new Set([
  'discovery-provider',
  'creator-node',
  'creator-node-2',
  'creator-node-3',
  'creator-node-4',
  'identity-service'
])
// Array to store time taken per service
const timeTakenPerService = []

// Path to audius-protocol
const PROTOCOL_DIR = config.get('protocol_dir')
// `cd` command to audius-protocol
const CD_PROTOCOL_DIR_COMMAND = `cd ${PROTOCOL_DIR};`

// Helper method to wait some desired time before executing next command
const wait = ms => {
  return new Promise((resolve, reject) => {
    console.log(`Waiting ${ms / 1000}s...`)
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// Pretty print fail or success with colors
const prettyPrintMsg = (input, msgType) => {
  const msg = `**************** ${input} ****************`

  switch (msgType) {
    case 'error':
      console.log(msg.error)
      break
    case 'success':
      console.log(msg.success)
      break
    case 'happy':
      console.log(msg.happy.bold)
      break
    default:
      console.log(msg)
  }
}

/** Executes shell commands in audius protocol directory, and logs the stdout and stderr streams.
 * If the shell command exits with a non-zero status code, reject the promise.
 *
 * Upon success, resolve the promise with stdout.
*/
const execShellCommandStream = (command, service) => {
  return new Promise((resolve, reject) => {
    // Increase the max buffer to 1024*1024 bytes = ~1MB
    if (service !== 'STOPPING ANY PRE-EXISTING SERVICES') {
      command = `${CD_PROTOCOL_DIR_COMMAND} ${command}`
    }

    const proc = exec(command, { maxBuffer: 1024 * 1024 })

    // Stream the stdout
    proc.stdout.on('data', data => {
      process.stdout.write(`${data}`)
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
 * Wrapper method to execute each command in the config
 * @param {*} commands array of commands to be executed
 * @param {*} serviceName name of service
 */
const execShellCommands = async (commands, serviceName) => {
  console.log(`Running ${serviceName}...`.brightYellow)

  // Iterate through all the build steps from setup-config.js
  try {
    for (const command of commands) {
      await execShellCommandStream(command, serviceName)
    }
  } catch (e) {
    throw new Error(`${serviceName} failed to start`, 'error')
  }

  prettyPrintMsg(`${serviceName} successfully started/ran!`, 'success')
}

/** Helper method to do a health check on discovery provider, creator node,
 *  and identity service.
 *
 * 1. Send a get request
 * 2. If successful (status code: 200), resolve the promise
 * 3 Else, recursively call fn again until health check passed or up to max-retires amount
 * 4. If max-retries amount is reached, reject the promise
 *
 */
const doHealthCheck = async (
  service,
  serviceName,
  healthCheckRetryCount = 0
) => {
  if (healthCheckRetryCount >= MAX_RETRIES) {
    return Promise.reject(new Error('Attemped max retries for health check'))
  }
  console.log(
    `Starting health check for ${serviceName} (attempt #${healthCheckRetryCount +
      1})...`.brightYellow
  )
  try {
    await wait(3000) // wait between every health check
    const response = await axios({
      method: 'get',
      url: `${service.protocol}://${service.host}:${service.port}/health_check`
    })
    console.log(`Server response:\n${JSON.stringify(response.data)}`)
    prettyPrintMsg(
      `Health check for ${serviceName} succeeded with status code: ${JSON.stringify(
        response.status
      )}!`,
      'success'
    )
    return Promise.resolve()
  } catch (e) {
    return doHealthCheck(service, serviceName, healthCheckRetryCount + 1)
  }
}

/**
 * Start up discovery provider, creator nodes, and identity service with the following steps:
 * 1. Build container
 * 2. Wait health check try time (arbitrary time defined in config)
 * 3. Check container health by sending a GET request to its health check endpoint
 * 4. Register the service (not for identity)
 *
 * In the case a service fails any of the above 3 main steps:
 * 1. Increase retry count (max retry of amount defined in config)
 * 2. If step 1 fails, tear down the service, increment rebuild count and reset retry count
 * 3. Retry
 *
 *  In the case that the max amount of retries were attempted and all failed,
 *  throw an error and stop the setup script.
 * @param {*} serviceName name of service being built
 * @param {*} restartServiceCount counter for num times service tried to rebuild
 */
const startServiceWithHealthCheckAndRetry = async (
  serviceName,
  restartServiceCount = 0
) => {
  const service = config.get(serviceName)
  let restartService = false

  // Build container and perform health check
  try {
    await execShellCommands(service.build, `Building ${serviceName}`)
    await wait(HEALTH_CHECK_WAIT_MS)
    await doHealthCheck(service, serviceName)
  } catch (e) {
    prettyPrintMsg(`${serviceName} failed to start `, 'error')
    restartService = true
  }

  // If health check fails after maxRetries amount, restart service and redo entire process
  if (restartServiceCount === MAX_RETRIES) {
    throw new Error(
      `${serviceName} failed to start after ${MAX_RETRIES} restart(s).`
    )
  }

  // If attempted max number of health checks, rebuild the service and try health checks again
  if (restartService) {
    console.log(
      `Attempting to rebuild ${serviceName} (attempt #${restartServiceCount +
        1})`
    )
    await execShellCommands(service.down, `Tearing down ${serviceName}...`)
    await wait(HEALTH_CHECK_WAIT_MS)
    await startServiceWithHealthCheckAndRetry(
      serviceName,
      restartServiceCount + 1
    )
  }

  // Register discovery provider and creator node
  try {
    if (serviceName !== 'identity-service' && serviceName !== 'content-service') {
      await execShellCommands(service.register, `Registering ${serviceName}`)
    }
  } catch (e) {
    prettyPrintMsg(`${serviceName} failed to register`, 'error')
    throw new Error(e)
  }

  prettyPrintMsg(
    `${serviceName} started up properly with registration and health check!`,
    'happy'
  )
}

/**
 *  Execute shell command and keep track of how long the command took
 * @param {*} serviceName name of service beinig buiilt
 * @param {*} startTime the time of when the command execution started
 * @param {*} action up or down
 */
const execShellCommandAndTrackTime = async (
  serviceName,
  startTime,
  action = 'up'
) => {
  // If: bringing all services down
  if (serviceName === 'all' && action === 'down') {
    await execShellCommands(
      config.get(serviceName).down,
      'STOPPING ANY PRE-EXISTING SERVICES'
    )
    // else if: building a service with healthcheck and registration endpoint
  } else if (SERVICES_WITH_HEALTH_CHECK_ENDPOINTS.has(serviceName)) {
    await startServiceWithHealthCheckAndRetry(serviceName)
  } else {
    // else: service does not have healthcheck and registration endpoint
    await execShellCommands(config.get(serviceName).build, serviceName)
  }

  const endTime = Date.now()

  // Keep track of each service and how long each one took
  timeTakenPerService.push({
    service: `${serviceName} ${action}`,
    timeMs: `${endTime - startTime}ms`,
    timeMin: `${((endTime - startTime) / 1000 / 60).toFixed(2)}min`
  })
}

/**
 * Build all the services in the Audius architecture
 */
const startAllServices = async () => {
  try {
    // Stop all pre-existing services
    await execShellCommandAndTrackTime('all', Date.now(), 'down')

    await Promise.all([
      await execShellCommandAndTrackTime('ipfs', Date.now()),
      await execShellCommandAndTrackTime('ipfs-2', Date.now()),
      await execShellCommandAndTrackTime('contracts', Date.now()),
      await execShellCommandAndTrackTime('eth-contracts', Date.now())
    ])

    // Run remaining services sequentially
    await execShellCommandAndTrackTime('init-contracts-info', Date.now())
    await execShellCommandAndTrackTime('init-token-versions', Date.now())

    // Manual call to distribute tokens (temp fix)
    await execShellCommands(
      config.get('distribute'),
      'distribute'
    )

    // Services with additional health checks and retry logic
    await execShellCommandAndTrackTime('discovery-provider', Date.now())
    await execShellCommandAndTrackTime('creator-node', Date.now())
    await execShellCommandAndTrackTime('creator-node-2', Date.now())
    await execShellCommandAndTrackTime('identity-service', Date.now())

    prettyPrintMsg('All services started up properly!', 'happy')
  } catch (e) {
    console.log(e)
    console.log(
      '\nCheck terminal logs for error stack trace.\nExiting script...'.bold.red
    )
  } finally {
    console.log('Time taken for services')
    console.log(timeTakenPerService)
  }
}

/**
 * Script to execute
 */
const run = async () => {
  const startTime = Date.now()
  const args = process.argv

  const service = args[2]
  const action = args[3]

  try {
    if (service === 'distribute') {
      // Manual call to distribute tokens (temp fix)
      await execShellCommands(
        config.get(service),
        service
      )
      return
    }

    switch (action) {
      // If the command is to tear down one service, get its tear down command
      // from config and run it
      case 'down':
        await execShellCommands(
          config.get(service).down,
          `Tearing down ${service}`
        )
        break
      case 'up':
        // If building all services, run startAllServices()
        // Else if the service requires an additional health check and/or registration,
        // run startServiceWithHealthCheckAndRetry()
        // Else, build service with no health check and rebuild logic
        if (service === 'all') {
          await startAllServices()
        } else if (SERVICES_WITH_HEALTH_CHECK_ENDPOINTS.has(service)) {
          await startServiceWithHealthCheckAndRetry(service)
        } else {
          await execShellCommands(config.get(service).build, service)
          prettyPrintMsg(`${service} started up properly!`, 'happy')
        }
        break
      default:
        console.log(`Should not reach here. CLI command: ${args}`)
    }
  } catch (e) {
    console.log(e)
    console.log(
      '\nCheck terminal logs for error stack trace.\nExiting script...'.bold.red
    )
  } finally {
    const endTime = Date.now()
    // Print time taken for script to 2 decimal places
    console.log(
      `This setup took ${endTime - startTime}ms/${(
        (endTime - startTime) /
        1000 /
        60
      ).toFixed(2)}min`
    )
  }
}

run()
