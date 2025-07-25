// mynode.js
const maxAPI = require("max-api");
maxAPI.post("Starting purform.js...");

let WebSocket;
try {
  WebSocket = require('ws');
  maxAPI.post("WebSocket module loaded successfully");
} catch (error) {
  maxAPI.post("Failed to load WebSocket module: " + error.message);
  return;
}

let wss;
try {
  wss = new WebSocket.Server({ port: 9000 });
  maxAPI.post("WebSocket server started on port 9000");
} catch (error) {
  maxAPI.post("Failed to start WebSocket server: " + error.message);
  return;
}

// Log when the script loads
maxAPI.post("My code runs!!");
maxAPI.post("Script initialization complete");

// Handle any message from Max
maxAPI.addHandler("bang", () => {
  maxAPI.outlet("got a bang!");
  maxAPI.post("Got banged");
});

let wsClients = [];

wss.on('connection', function connection(ws) {
  maxAPI.post("WebSocket client connected");
  wsClients.push(ws);
  
  // Send initial tempo to the newly connected client
  maxAPI.outlet('sendInitialTempo');

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

    // Handle messages by routing to Max for Live logic
    if (msgStr.trim() === 'getTrackNames') {
      maxAPI.post("Track names requested");
      maxAPI.outlet('getTrackNames');
    } else if (msgStr.trim() === 'recordBassClip') {
      maxAPI.post("Record Bass Clip requested");
      maxAPI.outlet('recordBassClip');
    } else if (msgStr.trim() === 'getTempo') {
      maxAPI.post("Tempo requested");
      maxAPI.outlet('getTempo');
    } else if (message === 'bang') {
      maxAPI.outlet('got a bang!');
    }
  });

  ws.on('close', () => {
    maxAPI.post("WebSocket client disconnected");
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

// Handler for receiving tempo updates from Max patch
maxAPI.addHandler('currentTempo', (...args) => {
  try {
    const tempo = Array.isArray(args[0]) ? args[0][1] : args[0];
    const tempoNumber = parseFloat(tempo);
    maxAPI.post('Sending tempo to WS: ' + tempoNumber);
    wsClients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'currentTempo', data: tempoNumber }));
      }
    });
  } catch (error) {
    maxAPI.post('Error handling currentTempo: ' + error.message);
  }
});