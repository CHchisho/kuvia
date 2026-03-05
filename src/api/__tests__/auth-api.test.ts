/**
 * API tests for auth endpoints using supertest + Jest.
 */
import express from 'express';
import request from 'supertest';

import { POST as registerPost } from '@/app/api/auth/register/route';
import { POST as loginPost } from '@/app/api/auth/login/route';

jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setSubject: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({ payload: {} }),
}));

// Mock database layer so tests do not require a real MySQL instance.
const mockQuery = jest.fn();
jest.mock('@/lib/db', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/lib/auth', () => {
  const original = jest.requireActual('@/lib/auth');
  return {
    ...original,
    createToken: jest.fn(async () => 'test-token'),
    getCookieOptions: jest.fn(() => ({
      name: 'auth',
      options: { httpOnly: true, path: '/' },
    })),
  };
});

const createApp = () => {
  const app = express();
  app.use(express.json());

  app.post('/api/auth/register', async (req, res) => {
    const nextReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const nextRes = await registerPost(nextReq);
    const data = await nextRes.json();
    res.status(nextRes.status).send(data);
  });

  app.post('/api/auth/login', async (req, res) => {
    const nextReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const nextRes = await loginPost(nextReq);
    const data = await nextRes.json();
    res.status(nextRes.status).send(data);
  });

  return app;
};

describe('Auth API', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('registers a new user successfully', async () => {
    // No existing user.
    mockQuery.mockResolvedValueOnce([]); // SELECT for existing user
    mockQuery.mockResolvedValueOnce({ insertId: 1 }); // INSERT user

    const app = createApp();

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret123',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user).toMatchObject({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    });
  });

  it('fails to log in with invalid credentials', async () => {
    // User not found.
    mockQuery.mockResolvedValueOnce([]); // SELECT user by email

    const app = createApp();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'missing@example.com',
        password: 'wrong',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('User not found');
  });
});
