/**
 * Tests unitarios para urlSanitizer
 */

const { buildUrl, sanitizeUrl } = require('../../../src/utils/urlSanitizer');

describe('URL Sanitizer Utils', () => {
  describe('sanitizeUrl', () => {
    it('debe retornar URL válida sin cambios', () => {
      const url = 'https://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('debe mantener la URL sin cambios si no tiene trailing slash', () => {
      const url = 'https://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com');
    });

    it('debe manejar URLs con trailing slash', () => {
      const url = 'https://example.com/';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com');
    });

    it('debe manejar null o undefined', () => {
      expect(sanitizeUrl(null)).toBe(null);
      expect(sanitizeUrl(undefined)).toBe(undefined);
    });
  });

  describe('buildUrl', () => {
    it('debe construir URL correctamente con base y path', () => {
      const baseUrl = 'https://example.com';
      const path = '/api/test';
      const result = buildUrl(baseUrl, path);
      expect(result).toBe('https://example.com/api/test');
    });

    it('debe manejar base URL con trailing slash', () => {
      const baseUrl = 'https://example.com/';
      const path = '/api/test';
      const result = buildUrl(baseUrl, path);
      expect(result).toBe('https://example.com/api/test');
    });

    it('debe manejar path sin leading slash', () => {
      const baseUrl = 'https://example.com';
      const path = 'api/test';
      const result = buildUrl(baseUrl, path);
      expect(result).toBe('https://example.com/api/test');
    });

    it('debe manejar path vacío', () => {
      const baseUrl = 'https://example.com';
      const path = '';
      const result = buildUrl(baseUrl, path);
      expect(result).toBe('https://example.com');
    });
  });
});

