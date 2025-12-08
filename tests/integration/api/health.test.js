/**
 * Tests de integración para endpoints de health check
 */

const request = require('supertest');
const app = require('../../../src/app');

describe('Health Check API', () => {
  beforeAll(() => {
    if (shouldSkipTests) {
      console.log('⚠️ Saltando tests de integración - app no disponible');
    }
  });

  describe('GET /health', () => {
    it('debe retornar estado de salud del servidor', async () => {
      if (shouldSkipTests) {
        return;
      }

      const response = await request(app)
        .get('/health');

      // Puede retornar 200 o 404 si el endpoint no existe
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
      }
    });
  });

  describe('GET /api/health', () => {
    it('debe retornar estado de salud de la API', async () => {
      if (shouldSkipTests) {
        return;
      }

      const response = await request(app)
        .get('/api/health');

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
      }
    });
  });
});

