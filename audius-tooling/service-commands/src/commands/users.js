const config = require('../../config/config')

const addUser = async (libsWrapper, metadata) => {
  const { error, phase, userId } = await libsWrapper.signUp({ metadata })

  if (error) {
    throw new Error(`Adding user error: ${error} in phase: ${phase}`)
  }

  return userId
}

const upgradeToCreator = async (libs, endpoint) => {
  await libs.upgradeToCreator({ endpoint, userNode: config.get('user_node') })
}

const getUser = async (libs, userId) => {
  return libs.getUser(userId)
}

module.exports = { addUser, upgradeToCreator, getUser }
