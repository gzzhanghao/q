import Ws from 'ws'
import Delta from 'quill-delta'

const commits = []
const connections = []
const indexOf = {}

let nextSessionId = 1

const server = new Ws.Server({
  port: 8081,
})

server.on('connection', socket => {
  const sessionId = nextSessionId++
  let commitId = 0

  socket.send(JSON.stringify({ type: 'init', sessionId }))

  connections.push(socket)

  socket.on('close', () => {
    connections.splice(connections.indexOf(socket), 1)
  })

  socket.on('message', data => {
    const msg = JSON.parse(data)

    let updateDelta = new Delta(msg.ops)

    for (let i = (indexOf[`${msg.base[0]},${msg.base[1]}`] || 0) + 1; i < commits.length; i++) {
      if (commits[i].sessionId === sessionId) {
        continue
      }
      updateDelta = commits[i].delta.transform(updateDelta, true)
    }

    indexOf[`${sessionId},${commitId}`] = commits.length
    commits.push({ sessionId, commitId, delta: updateDelta })

    for (const socket of connections) {
      socket.send(JSON.stringify({ type: 'sync', version: [sessionId, commitId], delta: updateDelta }))
    }

    commitId += 1
  })
})
