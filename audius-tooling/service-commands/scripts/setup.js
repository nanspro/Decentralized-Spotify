const ServiceCommands = require('../src/index')
const { allUp, Service, SetupCommand, runSetupCommand } = ServiceCommands

const NUM_CREATOR_NODES = 4

/**
 * Temporary setup script for upping and downing all services.
 */
const main = async () => {
  const args = process.argv
  
  if (args[2] === 'up') {
    console.log("Bringing up services...")
    await allUp({ numCreatorNodes: NUM_CREATOR_NODES })
    console.log("All services up!")
  } else if (args[2] === 'down'){
    console.log("Bringing down services...")
    await runSetupCommand(Service.ALL, SetupCommand.DOWN)
    console.log("Brought down all services!")
  } else {
    console.error("Invalid invocation. `node setup.js <up>/<down>`")
  }
}

main()

