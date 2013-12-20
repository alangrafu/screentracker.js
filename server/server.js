var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 9999})
  , fs = require('fs');

var filename = "stream_"+((new Date()).getTime())+"_"+(Math.floor(10000000* Math.random()));
var stream = fs.createWriteStream(filename);

process.stdout.write("Data will be stored in "+filename+"\n");
process.stdout.write("Terminate this process when you have obtained enough data.\n\n");
process.on('exit', function (){
  process.stdout.write("Goodbye!\n");
  stream.end();
});

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        stream.write(JSON.stringify(JSON.parse(message))+"\n");
    });
});
