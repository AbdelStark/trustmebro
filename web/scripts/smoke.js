const http = require('http')
const options = { host: 'localhost', port: 3000, path: '/', timeout: 3000 }
const req = http.request(options, res => {
  if (res.statusCode && res.statusCode < 400) process.exit(0)
  process.exit(1)
})
req.on('error', () => process.exit(1))
req.end()

