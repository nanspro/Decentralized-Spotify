const { exec } = require('child_process')

const execCommand = (
  command,
  isTearDownCommand = false,
  maxBuffer = 1024 * 1024
) => {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { maxBuffer })
    let stdout = ''
    let stderr = ''

    // Stream the stdout
    proc.stdout.on('data', data => {
      process.stdout.write(`${data}`)
      stdout = stdout.concat(`${data}`)
    })
    // Stream the stderr
    proc.stderr.on('data', data => {
      process.stdout.write(`${data}`)
      stderr = stderr.concat(`${data}`)
    })
    proc.on('close', exitCode => {
      /* If
        1. command is not the tear all servics down
        2. exitCode is not 0
        3. stdout or stderr contains the error message
        reject the promise and throw an error

        Else, resolve the promise */
      if (
        !isTearDownCommand &&
          (exitCode !== 0 ||
            stdout.includes('Check terminal logs for error stack trace.') ||
            stderr.includes('Check terminal logs for error stack trace.'))
      ) {
        reject(new Error(`${command} failed`))
        return
      }

      resolve()
    })
  })
}

module.exports = execCommand
