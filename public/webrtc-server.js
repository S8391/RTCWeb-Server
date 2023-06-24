const WebSocket = require('ws');
const { encrypt, decrypt } = require('./encryption.js');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        const parsedMessage = JSON.parse(decrypt(message));

        // Broadcast the message to every other connected WebSocket.
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(encrypt(JSON.stringify(parsedMessage)));
            }
        });
    });

    ws.on('close', () => {
        console.log('Lost a client');
    });

    console.log('Got a new client');
});

console.log('WebSocket server is running.');
