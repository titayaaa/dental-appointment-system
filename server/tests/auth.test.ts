import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { generateToken } from '../src/utils/jwt';

describe('Authentication & Role Middleware Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 OK with health status envelope', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.service).toBe('SmileSync Dental Clinic API');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with 400 when email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'staff@clinic.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Both email and password are required');
    });

    it('should reject login with 401 when user does not exist', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid email or password');
    });

    it('should reject login with 401 when password does not match hash', async () => {
      const passwordHash = await bcrypt.hash('correctPassword', 10);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'usr-1',
        email: 'staff@clinic.com',
        passwordHash,
        fullName: 'Staff User',
        phoneNumber: '0812345678',
        role: Role.STAFF,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'staff@clinic.com', password: 'wrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid email or password');
    });

    it('should authenticate successfully and return JWT token with user info', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'usr-staff-1',
        email: 'staff@clinic.com',
        passwordHash,
        fullName: 'Staff Somying',
        phoneNumber: '0812345678',
        role: Role.STAFF,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'staff@clinic.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('staff@clinic.com');
      expect(res.body.data.user.role).toBe('STAFF');
    });
  });

  describe('GET /api/auth/me & requireAuth Middleware (TEST-SEC-03 / 401)', () => {
    it('should reject with 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Authentication token is missing');
    });

    it('should reject with 401 when Authorization token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid or expired authentication token');
    });

    it('should return current user profile when valid token provided', async () => {
      const validToken = generateToken({
        id: 'usr-cust-1',
        email: 'customer1@test.com',
        fullName: 'Somsak Rakfundee',
        role: Role.CUSTOMER,
      });

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'usr-cust-1',
        email: 'customer1@test.com',
        passwordHash: 'hash',
        fullName: 'Somsak Rakfundee',
        phoneNumber: '0898765432',
        role: Role.CUSTOMER,
        createdAt: new Date('2026-11-01T00:00:00.000Z'),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('customer1@test.com');
      expect(res.body.data.role).toBe('CUSTOMER');
    });
  });

  describe('Role-Based Access Control Middleware (TEST-SEC-02 / 403 Forbidden)', () => {
    it('should reject CUSTOMER access to STAFF-only endpoint with 403 Forbidden', async () => {
      const customerToken = generateToken({
        id: 'usr-cust-1',
        email: 'customer1@test.com',
        fullName: 'Customer Somsak',
        role: Role.CUSTOMER,
      });

      const res = await request(app)
        .get('/api/test/staff-only')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: Access restricted to [STAFF]');
    });

    it('should grant access to STAFF user on STAFF-only endpoint with 200 OK', async () => {
      const staffToken = generateToken({
        id: 'usr-staff-1',
        email: 'staff@clinic.com',
        fullName: 'Staff Somying',
        role: Role.STAFF,
      });

      const res = await request(app)
        .get('/api/test/staff-only')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('Access granted');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 OK when logging out with valid token', async () => {
      const token = generateToken({
        id: 'usr-cust-1',
        email: 'customer1@test.com',
        fullName: 'Customer User',
        role: Role.CUSTOMER,
      });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('Logged out successfully');
    });
  });
});
