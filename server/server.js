var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 9999});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log(JSON.parse(message));
    });
    ws.send('something');
});
