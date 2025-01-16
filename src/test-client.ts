import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3002');

ws.on('open', () => {
  console.log('Connected to server');
  ws.send('healthcheck');
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  ws.close();
});

ws.on('close', () => {
  console.log('Disconnected from server');
});
