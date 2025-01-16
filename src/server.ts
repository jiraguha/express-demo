import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = 3002;

// ALB Health Check endpoint
app.get('/alb-health', (req, res) => {
  // Check if WebSocket server is running
  if (wss.clients.size >= 0) {
    res.status(200).json({
      status: 'healthy',
      connections: wss.clients.size,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      error: 'WebSocket server not responding',
      timestamp: new Date().toISOString()
    });
  }
});

// WebSocket healthcheck endpoint
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
