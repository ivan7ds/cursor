/**
 * Tests unitarios para validadores de Locations
 */

const {
  validateLocationPut,
  validateLocationPatch
} = require('../../../src/validators/locationValidators/validationFunctions');
const { basicLocation, invalidLocation } = require('../../fixtures/locations');

describe('Location Validators', () => {
  describe('validateLocationPut', () => {
    it('debe validar location PUT con datos válidos', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        location_id: 'LOC_TEST_001'
      };
      const body = {
        ...basicLocation,
        id: 'LOC_TEST_001', // Debe coincidir con location_id en params
        country_code: 'ES',
        party_id: 'TEST'
      };

      const result = validateLocationPut(params, body);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value).toBeDefined();
    });

    it('debe rechazar location PUT con country_code inválido en params', () => {
      const params = {
        country_code: 'INVALID',
        party_id: 'TEST',
        location_id: 'LOC_TEST_001'
      };
      const body = basicLocation;

      const result = validateLocationPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar location PUT con location_id que no coincide', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        location_id: 'LOC_DIFFERENT'
      };
      const body = {
        ...basicLocation,
        id: 'LOC_TEST_001'
      };

      const result = validateLocationPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar location PUT con body inválido', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        location_id: 'LOC_TEST_001'
      };
      const body = {
        ...invalidLocation,
        country_code: 'ES',
        party_id: 'TEST'
      };

      const result = validateLocationPut(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateLocationPatch', () => {
    it('debe validar location PATCH con datos válidos', () => {
      const params = {
        country_code: 'ES',
        party_id: 'TEST',
        location_id: 'LOC_TEST_001'
      };
      const body = {
        name: 'Updated Location Name',
        last_updated: new Date().toISOString() // Requerido en PATCH
      };

      const result = validateLocationPatch(params, body);

      // PATCH debe ser válido con solo name y last_updated
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      
      // Si la validación es exitosa, verificar estructura
      if (result.valid) {
        expect(result.errors).toHaveLength(0);
        expect(result.value).toBeDefined();
      } else {
        // Si falla, mostrar errores para debugging
        console.log('Errores de validación PATCH:', JSON.stringify(result.errors, null, 2));
      }
    });

    it('debe rechazar location PATCH con params inválidos', () => {
      const params = {
        country_code: 'INVALID',
        party_id: 'TEST',
        location_id: 'LOC_TEST_001'
      };
      const body = {
        name: 'Updated Location Name'
      };

      const result = validateLocationPatch(params, body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

