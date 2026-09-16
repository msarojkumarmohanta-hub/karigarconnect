const request = require('supertest');
const app = require('../src/app');
test('health endpoint returns service status', async () => {
  const response = await request(app).get('/api/v1/health');
  expect(response.status).toBe(200);
  expect(response.body.service).toBe('KarigarConnect API');
});
