const Server = require('./bin/server.js')
const server = new Server()

server.startServer()

// setInterval(function () {
//   const now = new Date()
//   console.log(`Timestamp: ${now.toLocaleString()}`)
// }, 10000)
