import Sockette from "sockette";

const ws = new Sockette(
    `ws://localhost:${process.env.COMMUNICATOR_WS_PORT}`,
    {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: () => {
            console.log(`Connected!`);
            ws.send(`Hello, world!`);
        },
        onmessage: (e) => console.log(`Received:`, e.data),
        onreconnect: () => console.log(`Reconnecting...`),
        onmaximum: () => console.log(`Stop Attempting!`),
        onclose: () => console.log(`Closed!`),
        onerror: (e) => console.log(`Error:`, e),
    }
);
