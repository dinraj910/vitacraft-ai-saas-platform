const request = require('supertest');
const app     = require('../src/app');

describe('Auth API — /api/v1/auth', () => {
  const user = { name: 'Test User', email: `test_${Date.now()}@vitacraft.ai`, password: 'TestPass123' };
  let accessToken;

  describe('POST /register', () => {
    it('201 — registers new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(user);
      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('accessToken');
      accessToken = res.body.data.accessToken;
    });

    it('409 — duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(user);
      expect(res.statusCode).toBe(409);
    });

    it('400 — invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ name: 'X', email: 'bad', password: 'Test123' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /login', () => {
    it('200 — correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });
      expect(res.statusCode).toBe(200);
      accessToken = res.body.data.accessToken;
    });

    it('401 — wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'Wrong123' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /me', () => {
    it('200 — returns user with credits', async () => {
      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('creditAccount');
    });

    it('401 — no token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('200 — health ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
    });
  });
});