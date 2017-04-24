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
    console.log("http...");
});
var connections=0;
const wss = new WebSocketServer({ server: server });
wss.messages=[];
wss.on('connection', (ws) => {
    console.log("start connection");
    
    connections++; 
    var tmp="S "+connections+" "+getKb();
    wss.broadcast(tmp);
    wss.messages.forEach(function(msg) {
        ws.send(msg);
    });
    console.log('connections: ' + connections);
    ws.on('message',onMessage);
    ws.on('error', function() {
        console.log("error");
    });
    
    ws.on('close', () => {
        connections--;
        var tmp="S "+connections+" "+getKb();
        wss.broadcast(tmp);
        console.log('connections: ' + connections);
        console.log('Connection closed')
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
      console.log('received: ' + message);
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
    console.log(wss.messages);
    wss.messages.forEach(function(msg) {
        size += Buffer.byteLength(msg, 'utf8')
        console.log("loop:"+size);
    });
    console.log(size+"=>"+size/1024);
    return size/1024;
}


/*
h.onConnection([&h](uWS::WebSocket<uWS::SERVER> ws, uWS::HttpRequest req) {
        // send this client all stored messages in one batch send
        uWS::WebSocket<uWS::SERVER>::PreparedMessage *preparedMessageBatch = uWS::WebSocket<uWS::SERVER>::prepareMessageBatch(storedMessages, excludedMessages, uWS::TEXT, false);
        ws.sendPrepared(preparedMessageBatch);
        ws.finalizeMessage(preparedMessageBatch);

        // broadcast number of clients connected to everyone
        std::string tmp = "S " + std::to_string(++connections) + " " +  std::to_string(getKb());
        h.getDefaultGroup<uWS::SERVER>().broadcast(tmp.data(), tmp.length(), uWS::TEXT);
    });

    h.onMessage([&h](uWS::WebSocket<uWS::SERVER> ws, char *data, size_t length, uWS::OpCode opCode) {
        if (length && data[0] != 'S' && length < 4096) {
            // add this message to the store, cut off old messages
            if (storedMessages.size() == 50) {
                storedMessages.erase(storedMessages.begin());
            }
            storedMessages.push_back(std::string(data, length));
            //std::cout << "Message posted: " << storedMessages.back() << std::endl;

            // simply broadcast this message to everyone (completely without any timeout optimization!)
            h.getDefaultGroup<uWS::SERVER>().broadcast(data, length, uWS::TEXT);
        }
    });

    h.onDisconnection([&h](uWS::WebSocket<uWS::SERVER> ws, int code, char *message, size_t length) {
        // broadcast number of clients connected to everyone
        std::string tmp = "S " + std::to_string(--connections) + " " +  std::to_string(getKb());
        h.getDefaultGroup<uWS::SERVER>().broadcast(tmp.data(), tmp.length(), uWS::TEXT);
    });
*/
server.listen(3000);

//console.trace();
