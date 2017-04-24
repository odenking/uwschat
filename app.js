'use strict';

const http = require('http');
const WebSocket = require('uws');
const WebSocketServer = WebSocket.Server;

var fs = require('fs');

const document = fs.readFileSync(__dirname + '/index.html');
const server = http.createServer((req, res) => {
    // handle some GET url
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(document);
    }
    //console.log("http...");
});
var connections=0;
const wss = new WebSocketServer({ server: server });
wss.messages=[];
wss.on('connection', (ws) => {
    //console.log("start connection");
    
    connections++; 
    var tmp="S "+connections+" "+getKb();
    wss.broadcast(tmp);
    wss.messages.forEach(function(msg) {
        ws.send(msg);
    });
    //console.log('connections: ' + connections);
    ws.on('message',onMessage);
    ws.on('error', function() {
        console.log("error");
    });
    
    ws.on('close', () => {
        connections--;
        var tmp="S "+connections+" "+getKb();
        wss.broadcast(tmp);
        //console.log('connections: ' + connections);
        //console.log('Connection closed')
    })
});
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
function onMessage(message) {
      //console.log('received: ' + message);
      wss.messages.push(message);
      
      wss.clients.forEach(function each(client) {
          if (client !== this && client.readyState === WebSocket.OPEN) {
             client.send(message);
          }
      });
      var tmp="S "+connections+" "+getKb();
      wss.broadcast(tmp);
}
function getKb() {
    var size=0;
    //console.log(wss.messages);
    wss.messages.forEach(function(msg) {
        size += Buffer.byteLength(msg, 'utf8')
       // console.log("loop:"+size);
    });
    //console.log(size+"=>"+size/1024);
    return size/1024;
}


server.listen(3000);

