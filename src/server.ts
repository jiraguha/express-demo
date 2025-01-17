import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import mongoose from 'mongoose';
import { Fruit } from './models/fruit';

const app = express();
app.use(express.json());

// MongoDB connection and collection initialization
mongoose.connect('mongodb://localhost:27017/fruits-db')
  .then(async () => {
    console.log('Connected to MongoDB');
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Check if collection exists
    const collections = await db?.listCollections({ name: 'fruits' }).toArray();
    if (collections?.length === 0) {
      // Create the collection if it doesn't exist
      await db?.collection('fruits');
      console.log('Fruits collection created');
      
      // Create index on name field
      await db?.collection('fruits').createIndex({ name: 1 }, { unique: true });
      console.log('Index created on name field');
    } else {
      console.log('Fruits collection already exists');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = 3002;

// ALB Health Check endpoint
app.get('/ws-health', (req, res) => {
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

// Fruit CRUD endpoints
app.post('/fruits', async (req, res) => {
  try {
    const fruit = new Fruit(req.body);
    await fruit.save();
    res.status(201).json(fruit);
   } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/fruits', async (req, res) => {
  try {
    const fruits = await Fruit.find();
    res.json(fruits);
   } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/fruits/:id', async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);
    if (!fruit) return res.status(404).json({ error: 'Fruit not found' });
    res.json(fruit);
   } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/fruits/:id', async (req, res) => {
  try {
    const fruit = await Fruit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fruit) return res.status(404).json({ error: 'Fruit not found' });
    res.json(fruit);
   } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/fruits/:id', async (req, res) => {
  try {
    const fruit = await Fruit.findByIdAndDelete(req.params.id);
    if (!fruit) return res.status(404).json({ error: 'Fruit not found' });
    res.json({ message: 'Fruit deleted successfully' });
   } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export { app, server, wss };
