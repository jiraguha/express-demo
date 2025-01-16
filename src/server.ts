import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = 3002;

// Regular HTTP endpoint for compatibility
app.get('/healthcheck', (req, res) => {
  res.json({ status: 'healthy' });
});

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // Handle incoming messages
  ws.on('message', (message: string) => {
    if (message.toString() === 'healthcheck') {
      ws.send(JSON.stringify({ status: 'healthy' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
