/**
 * Tests unitarios para validadores de Tokens
 */

const { validateTokenPut } = require('../../../src/validators/tokenValidators/putValidators');
const { basicToken, invalidToken } = require('../../fixtures/tokens');

describe('Token Validators', () => {
  describe('validateTokenPut', () => {
    it('debe validar token PUT con datos válidos', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        token_uid: 'TOKEN_TEST_001'
      };
      const body = basicToken;

      const result = validateTokenPut(params, body);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value).toBeDefined();
    });

    it('debe rechazar token PUT con country_code inválido en params', () => {
      const params = {
        country_code: 'INVALID',
        party_id: 'TEST',
        token_uid: 'TOKEN_TEST_001'
      };
      const body = basicToken;

      const result = validateTokenPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar token PUT con token_uid que no coincide', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        token_uid: 'DIFFERENT_TOKEN'
      };
      const body = {
        ...basicToken,
        uid: 'TOKEN_TEST_001'
      };

      const result = validateTokenPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar token PUT con body inválido', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        token_uid: 'TOKEN_TEST_001'
      };
      const body = invalidToken;

      const result = validateTokenPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe validar campos requeridos de token', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        token_uid: 'TOKEN_TEST_001'
      };
      const body = {
        uid: 'TOKEN_TEST_001'
        // Faltan: type, auth_id, issuer, valid, whitelist
      };

      const result = validateTokenPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

