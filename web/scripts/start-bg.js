// Usage: node scripts/start-bg.js '<cmd>' <port> <pidFile> <logFile> [readyPath]
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')
const path = require('path')

const [,, cmd, portArg, pidFile, logFile, readyPath = '/'] = process.argv
const port = Number(portArg)

const child = spawn(cmd, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
fs.mkdirSync(path.dirname(logFile), { recursive: true })
fs.mkdirSync(path.dirname(pidFile), { recursive: true })
fs.writeFileSync(pidFile, String(child.pid))
const log = fs.createWriteStream(logFile, { flags: 'a' })
child.stdout.pipe(log); child.stderr.pipe(log)

function checkReady(retries=60) {
  if (retries <= 0) process.exit(1)
  const req = http.get({ host: 'localhost', port, path: readyPath }, res => {
    if (res.statusCode && res.statusCode < 500) process.exit(0)
    else setTimeout(() => checkReady(retries - 1), 1000)
  })
  req.on('error', () => setTimeout(() => checkReady(retries - 1), 1000))
}
checkReady()
