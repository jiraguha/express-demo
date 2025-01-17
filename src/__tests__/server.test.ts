import request from 'supertest';
import { app, server, wss } from '../server';
import WebSocket from 'ws';

describe('HTTP Endpoints', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /alb-health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/alb-health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('connections');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /healthcheck', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/healthcheck');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy' });
    });
  });
});

describe('WebSocket Connection', () => {
  let ws: WebSocket;

  beforeEach((done) => {
    ws = new WebSocket('ws://localhost:3002');
    ws.on('open', () => {
      done();
    });
  });

  afterEach((done) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    done();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should respond to healthcheck message', (done) => {
    ws.send('healthcheck');
    ws.on('message', (data) => {
      const response = JSON.parse(data.toString());
      expect(response).toEqual({ status: 'healthy' });
      done();
    });
  });
});
