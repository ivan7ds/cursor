/**
 * Tests unitarios para tokenEncoding
 */

const { buildAuthorizationHeader } = require('../../../src/utils/tokenEncoding');

describe('Token Encoding Utils', () => {
  describe('buildAuthorizationHeader', () => {
    it('debe construir header con Token cuando token_base64_encoded es false', () => {
      const token = 'test_token_123';
      const header = buildAuthorizationHeader(token, false);
      expect(header).toBe(`Token ${token}`);
    });

    it('debe construir header con Token cuando token_base64_encoded es undefined', () => {
      const token = 'test_token_123';
      const header = buildAuthorizationHeader(token);
      expect(header).toBe(`Token ${token}`);
    });

    it('debe construir header con Token codificado cuando token_base64_encoded es true', () => {
      const token = 'test_token_123';
      const header = buildAuthorizationHeader(token, true);
      // Cuando token_base64_encoded es true, el token se codifica en base64
      const expectedEncoded = Buffer.from(token, 'utf8').toString('base64');
      expect(header).toBe(`Token ${expectedEncoded}`);
    });

    it('debe manejar tokens vacíos', () => {
      const token = '';
      const header = buildAuthorizationHeader(token, false);
      expect(header).toBe('Token ');
    });
  });
});

