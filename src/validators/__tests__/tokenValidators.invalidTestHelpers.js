const {
  buildValidTokenData,
  buildRouteParams,
  runTokenValidation
} = require('./tokenValidators.testHelpers');

/**
 * Ejecuta test para campo requerido faltante
 */
function testMissingRequiredField() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123');
  delete body.type;

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(result.errors[0].field).toBe('type');
}

/**
 * Ejecuta test para tipo inválido
 */
function testInvalidType() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123', {
    type: 'INVALID_TYPE'
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.field === 'type')).toBe(true);
}

/**
 * Ejecuta test para country_code que excede longitud máxima
 */
function testCountryCodeExceedsMaxLength() {
  const params = buildRouteParams('ESP', 'ABC', 'token-123');
  const body = buildValidTokenData('ESP', 'ABC', 'token-123');

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
}

/**
 * Ejecuta test para UID que no coincide entre path y body
 */
function testUidMismatch() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-DIFFERENT');

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.type === 'mismatch')).toBe(true);
}

/**
 * Ejecuta test para timestamp con offset de zona horaria
 */
function testTimestampWithTimezoneOffset() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123', {
    last_updated: '2025-01-15T10:30:00+00:00'
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.field === 'last_updated')).toBe(true);
}

/**
 * Ejecuta test para código de idioma inválido
 */
function testInvalidLanguageCode() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123', {
    language: 'xyz'
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.field === 'language')).toBe(true);
}

/**
 * Ejecuta test para energy_contract sin supplier_name requerido
 */
function testMissingSupplierName() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123', {
    energy_contract: {
      contract_id: 'energy-contract-123'
    }
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.field.includes('supplier_name'))).toBe(true);
}

/**
 * Ejecuta test para string con caracteres no imprimibles
 */
function testNonPrintableCharacters() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123', {
    issuer: 'Test\nCompany'
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.field === 'issuer')).toBe(true);
}

module.exports = {
    testMissingRequiredField,
    testInvalidType,
    testCountryCodeExceedsMaxLength,
    testUidMismatch,
    testTimestampWithTimezoneOffset,
    testInvalidLanguageCode,
    testMissingSupplierName,
    testNonPrintableCharacters
};

