const { validateTokenPut, TOKEN_TYPES, WHITELIST_TYPES, PROFILE_TYPES } = require('../tokenValidators');

describe('Token PUT Validator', () => {
  describe('Valid Token Data', () => {
    test('should validate complete valid token with all fields', () => {
      const params = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123'
      };

      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        visual_number: 'VISUAL-001',
        issuer: 'Test Company',
        group_id: 'group-001',
        valid: true,
        whitelist: 'ALLOWED',
        language: 'es',
        default_profile_type: 'REGULAR',
        energy_contract: {
          supplier_name: 'Energy Supplier Inc',
          contract_id: 'energy-contract-123'
        },
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value).toMatchObject(body);
    });

    test('should validate minimal valid token (only required fields)', () => {
      const params = {
        country_code: 'PT',
        party_id: 'XYZ',
        uid: 'minimal-token'
      };

      const body = {
        country_code: 'PT',
        party_id: 'XYZ',
        uid: 'minimal-token',
        type: 'APP_USER',
        contract_id: 'contract-456',
        issuer: 'Minimal Issuer',
        valid: false,
        whitelist: 'NEVER',
        last_updated: '2025-01-15T10:30:00'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate token with fractional seconds in timestamp', () => {
      const params = { country_code: 'ES', party_id: 'IPD', uid: 'token-999' };
      const body = {
        country_code: 'ES',
        party_id: 'IPD',
        uid: 'token-999',
        type: 'OTHER',
        contract_id: 'contract-999',
        issuer: 'Test Issuer',
        valid: true,
        whitelist: 'ALWAYS',
        last_updated: '2025-01-15T10:30:00.123Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(true);
    });

    test('should validate all token types', () => {
      TOKEN_TYPES.forEach(type => {
        const params = { country_code: 'ES', party_id: 'TST', uid: `token-${type}` };
        const body = {
          country_code: 'ES',
          party_id: 'TST',
          uid: `token-${type}`,
          type,
          contract_id: 'contract-test',
          issuer: 'Test Issuer',
          valid: true,
          whitelist: 'ALLOWED',
          last_updated: '2025-01-15T10:30:00Z'
        };

        const result = validateTokenPut(params, body);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate all whitelist types', () => {
      WHITELIST_TYPES.forEach(whitelist => {
        const params = { country_code: 'ES', party_id: 'TST', uid: `token-${whitelist}` };
        const body = {
          country_code: 'ES',
          party_id: 'TST',
          uid: `token-${whitelist}`,
          type: 'RFID',
          contract_id: 'contract-test',
          issuer: 'Test Issuer',
          valid: true,
          whitelist,
          last_updated: '2025-01-15T10:30:00Z'
        };

        const result = validateTokenPut(params, body);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate all profile types', () => {
      PROFILE_TYPES.forEach(profileType => {
        const params = { country_code: 'ES', party_id: 'TST', uid: `token-${profileType}` };
        const body = {
          country_code: 'ES',
          party_id: 'TST',
          uid: `token-${profileType}`,
          type: 'RFID',
          contract_id: 'contract-test',
          issuer: 'Test Issuer',
          valid: true,
          whitelist: 'ALLOWED',
          default_profile_type: profileType,
          last_updated: '2025-01-15T10:30:00Z'
        };

        const result = validateTokenPut(params, body);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Invalid Token Data', () => {
    test('should fail when required field is missing (type)', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        // type: missing
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('type');
    });

    test('should fail when type is invalid', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'INVALID_TYPE',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'type')).toBe(true);
    });

    test('should fail when country_code exceeds max length', () => {
      const params = { country_code: 'ESP', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ESP', // Should be max 2 chars
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
    });

    test('should fail when uid in path does not match body', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-DIFFERENT', // Mismatch
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'mismatch')).toBe(true);
    });

    test('should fail when timestamp has timezone offset', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00+00:00' // Not allowed
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'last_updated')).toBe(true);
    });

    test('should fail when language code is invalid', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        language: 'xyz', // Invalid ISO 639-1 code
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'language')).toBe(true);
    });

    test('should fail when energy_contract is missing required supplier_name', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        energy_contract: {
          // supplier_name missing
          contract_id: 'energy-contract-123'
        },
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field.includes('supplier_name'))).toBe(true);
    });

    test('should fail when string contains non-printable characters', () => {
      const params = { country_code: 'ES', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test\nCompany', // Contains line break
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'issuer')).toBe(true);
    });
  });

  describe('Case Insensitive Validation', () => {
    test('should accept case-insensitive match for country_code', () => {
      const params = { country_code: 'es', party_id: 'ABC', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(true);
    });

    test('should accept case-insensitive match for party_id', () => {
      const params = { country_code: 'ES', party_id: 'abc', uid: 'token-123' };
      const body = {
        country_code: 'ES',
        party_id: 'ABC',
        uid: 'token-123',
        type: 'RFID',
        contract_id: 'contract-123',
        issuer: 'Test Company',
        valid: true,
        whitelist: 'ALLOWED',
        last_updated: '2025-01-15T10:30:00Z'
      };

      const result = validateTokenPut(params, body);
      expect(result.valid).toBe(true);
    });
  });
});
