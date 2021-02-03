const server = require('http').createServer((request, response) => {
  response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  })
  response.end('hey there!')
})

const socketIo = require('socket.io')
const io = socketIo(server, {
  cors: {
      origin: '*',
      credentials: false
  }
})

io.on('connection', socket => {
  console.log('connection', socket.id)
  socket.on('join-room', (roomId, userId) => {
      
      // adiciona os usuarios na mesma sala
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId)
      socket.on('disconnect', () => {
          console.log('disconnected!', roomId, userId)
          socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })

      
      socket.on('user-message',(roomId, message) => {
        console.log("Enviando mensagem!")
        socket.to(roomId).broadcast.emit('receive-message', message)
      })
      
      socket.on('user-camera',(roomId, videoUserId) => {
        console.log("Bloqueando camera!")
        socket.to(roomId).broadcast.emit('receive-status-camera', videoUserId)
      })

      socket.on('user-microphone',(roomId, microphoneUserId) => {
        console.log("Mutando microfone")
        socket.to(roomId).broadcast.emit('receive-status-microphone', microphoneUserId)
      })
    })
})

const startServer = () => {
  const { address, port } = server.address()
  console.info(`app running at ${address}:${port}`)
}

server.listen(process.env.PORT || 3001, startServer)