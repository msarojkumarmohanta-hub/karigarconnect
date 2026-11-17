const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const adminController = require('../src/controllers/admin.controller');

describe('public API contracts', () => {
  test('returns a consistent 404 envelope', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });

  test('protects authenticated endpoints', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
  });

  test('allows a Vite development origin on a non-default port', async () => {
    const response = await request(app).get('/health').set('Origin', 'http://localhost:5174');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5174');
  });

  test('serves Swagger documentation', async () => {
    const response = await request(app).get('/api/docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');
  });
});

describe('admin controller guards', () => {
  test('returns 404 when blocking a missing user', async () => {
    const findByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);
    const next = jest.fn();

    await adminController.block({ params: { id: 'missing-user-id' } }, { status: jest.fn().mockReturnThis(), json: jest.fn() }, next);

    expect(findByIdAndUpdate).toHaveBeenCalledWith('missing-user-id', { isActive: false }, { new: true });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404, code: 'USER_NOT_FOUND' }));
    findByIdAndUpdate.mockRestore();
  });

  test('returns 404 when unblocking a missing user', async () => {
    const findByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);
    const next = jest.fn();

    await adminController.unblock({ params: { id: 'missing-user-id' } }, { status: jest.fn().mockReturnThis(), json: jest.fn() }, next);

    expect(findByIdAndUpdate).toHaveBeenCalledWith('missing-user-id', { isActive: true }, { new: true });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404, code: 'USER_NOT_FOUND' }));
    findByIdAndUpdate.mockRestore();
  });
});
