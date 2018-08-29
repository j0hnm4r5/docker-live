const WebSocket = require(`ws`);

const wss = new WebSocket.Server({
    port: process.env.COMMUNICATOR_WS_PORT,
});
wss.on(`connection`, (ws) => {
    ws.on(`message`, (message) => {
        console.log(`Received: %s`, message);
    });

    ws.send(`something`);
});
