'use strict';

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _quillDelta = require('quill-delta');

var _quillDelta2 = _interopRequireDefault(_quillDelta);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commits = [];
var connections = [];
var indexOf = {};

var nextSessionId = 1;

var server = new _ws2.default.Server({
  port: 8081
});

server.on('connection', function (socket) {
  var sessionId = nextSessionId++;
  var commitId = 0;

  socket.send(JSON.stringify({ type: 'init', sessionId: sessionId }));

  connections.push(socket);

  socket.on('close', function () {
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on('message', function (data) {
    var msg = JSON.parse(data);

    var updateDelta = new _quillDelta2.default(msg.ops);

    for (var i = (indexOf[msg.base[0] + ',' + msg.base[1]] || 0) + 1; i < commits.length; i++) {
      if (commits[i].sessionId === sessionId) {
        continue;
      }
      updateDelta = commits[i].delta.transform(updateDelta, true);
    }

    indexOf[sessionId + ',' + commitId] = commits.length;
    commits.push({ sessionId: sessionId, commitId: commitId, delta: updateDelta });

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = connections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _socket = _step.value;

        _socket.send(JSON.stringify({ type: 'sync', version: [sessionId, commitId], delta: updateDelta }));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    commitId += 1;
  });
});