import Quill from 'quill'
import Delta from 'quill-delta'

const COMMIT_TIMEOUT = 200

window.Delta = Delta

const quill = new Quill('#editor', {
  theme: 'snow',
})

const commits = {}

const socket = new WebSocket('ws://127.0.0.1:8081')

let sessionId = 0
let serverVersion = [0, 0]
let latestCommitId = 0
let nextCommitId = 0

let serverDelta = new Delta
let clientDelta = new Delta

let commitTimeout = null

quill.on('text-change', (delta, content, source) => {
  if (source !== 'user') {
    return
  }
  clientDelta = clientDelta.compose(delta)
  if (commitTimeout) {
    return
  }
  commitTimeout = setTimeout(() => {
    commitTimeout = null
    commit()
  }, COMMIT_TIMEOUT)
})

quill.on('selection-change', (toRange, fromRange, source) => {
  // @todo
})

socket.addEventListener('message', event => {
  const data = JSON.parse(event.data)

  switch (data.type) {

    case 'init': {
      sessionId = data.sessionId
      break
    }

    case 'sync': {
      sync(data.version, new Delta(data.delta))
      break
    }
  }
})

function commit() {
  socket.send(JSON.stringify({ base: serverVersion, ops: clientDelta.ops }))
  commits[nextCommitId++] = clientDelta
  clientDelta = new Delta
}

function sync(version, delta) {
  serverVersion = version
  serverDelta = serverDelta.compose(delta)

  if (version[0] === sessionId) {
    delete commits[latestCommitId]
    latestCommitId += 1
    return
  }

  let updateDelta = delta

  for (let commitId = latestCommitId; commitId < nextCommitId; commitId++) {
    commits[commitId] = delta.transform(commits[commitId])
    updateDelta = commits[commitId].transform(updateDelta, false)
  }

  quill.updateContents(updateDelta, 'api')
}
