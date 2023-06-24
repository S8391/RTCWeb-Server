require('dotenv').config();
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;

if (!JWT_SECRET_KEY || !SSL_CERT_PATH || !SSL_KEY_PATH) {
  console.error('Missing necessary environment variables.');
  process.exit(1);
}
const server = https.createServer({
  cert: fs.readFileSync(SSL_CERT_PATH),
  key: fs.readFileSync(SSL_KEY_PATH),
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const parameters = url.parse(req.url, true);
  const token = parameters.query.token;

  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY);
    ws.user = payload.user;
  } catch (err) {
    console.log('Invalid JWT', err);
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid JWT' }));
    ws.close();
    return;
  }

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    //broadcast message to all other "clients" within the "room"    
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN && client.user.room === ws.user.room) {
        client.send(message);
      }
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', (code, reason) => {
    console.log('WebSocket connection closed. Code:', code, 'Reason:', reason);
  });
});

server.listen(8080, () => {
  console.log('Signaling server started on port 8080');
});
