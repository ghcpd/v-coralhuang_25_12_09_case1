const request = require('supertest');
const express = require('express');
const fs = require('fs');

// Start the actual server module (it starts listening), so instead we import the app by requiring server.js
// To keep things simple for the test, we'll require the server and test /health

let server;
describe('Basic server', () => {
  beforeAll(async () => {
    const mod = require('../server');
    server = await mod.start();
  });

  afterAll(() => {
    if (server && server.close) server.close();
  });

  test('GET /health', async () => {
    const res = await request('http://localhost:3000').get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  }, 10000);

  test('POST /api/classify without file', async () => {
    const res = await request('http://localhost:3000').post('/api/classify');
    expect(res.statusCode).toBe(400);
  });
});
