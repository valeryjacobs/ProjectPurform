// mynode.js
const maxAPI = require("max-api");
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Log when the script loads
maxAPI.post("My code runs!!");

// Handle any message from Max
maxAPI.addHandler("bang", () => {
  maxAPI.outlet("got a bang!");
  maxAPI.post("Got banged");
});

let wsClients = [];

wss.on('connection', function connection(ws) {
  wsClients.push(ws);

  ws.on('message', function incoming(message) {
    maxAPI.post(`typeof message: ${typeof message}`);
    maxAPI.post(`message.constructor: ${message.constructor && message.constructor.name}`);
    maxAPI.post(`message: ${JSON.stringify(message)}`);
    maxAPI.post(`message.toString(): ${message.toString()}`);

    let msgStr;
    if (typeof message === 'string') {
      msgStr = message;
    } else if (Buffer.isBuffer(message)) {
      msgStr = message.toString('utf8');
    } else if (message && typeof message.toString === 'function') {
      msgStr = message.toString();
    } else {
      msgStr = String(message);
    }

    maxAPI.post(`msgStr: "${msgStr}"`);
    maxAPI.post(`msgStr.trim(): "${msgStr.trim()}"`);

    if (msgStr.trim() === 'getTrackNames') {
      maxAPI.post("Track names requested");
      maxAPI.outlet('getTrackNames');
    }
    // Optionally, handle messages and trigger Max events
    if (message === 'bang') {
      maxAPI.outlet('got a bang!');
    }
  });

  ws.on('close', () => {
    wsClients = wsClients.filter(client => client !== ws);
  });

  // Send a message to React when connected
  ws.send('Connected to Max for Live! Yeah!!');
});

// Send messages from Max to all WebSocket clients
function sendToWebSocketClients(msg) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

maxAPI.addHandler("add", (a, b) => {
  const result = Number(a) + Number(b);
  maxAPI.outlet(result);
  sendToWebSocketClients(`add result: ${result}`);
});

maxAPI.addHandler("anything", (msg, ...args) => {
  maxAPI.post(`Received message: ${msg} ${args.join(" ")}`);
  maxAPI.outlet(`Echo: ${msg} ${args.join(" ")}`);
});

// Handler for receiving track names from Max patch
maxAPI.addHandler('trackNames', (...names) => {
  const namesArray = Array.isArray(names[0]) ? names[0] : names;
  maxAPI.post('Sending track names to WS: ' + JSON.stringify(namesArray));
  wsClients.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'trackNames', data: namesArray }));
    }
  });
});