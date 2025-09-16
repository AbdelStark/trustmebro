// Usage: node scripts/stop-bg.js <port> <pidFile>
const fs = require('fs')
const { execSync } = require('child_process')

const [,, portArg, pidFile] = process.argv
const port = Number(portArg)

try {
  if (fs.existsSync(pidFile)) {
    const pid = Number(fs.readFileSync(pidFile, 'utf8').trim())
    if (pid) {
      try { process.kill(pid) } catch {}
      fs.unlinkSync(pidFile)
    }
  }
} catch {}

try {
  execSync(process.platform === 'win32' ? `netstat -ano | find "${port}"` : `lsof -i :${port}`)
  console.error(`Port ${port} still in use`); process.exit(1)
} catch {}

