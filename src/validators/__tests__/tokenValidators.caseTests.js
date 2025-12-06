const {
  buildValidTokenData,
  buildRouteParams,
  runTokenValidation
} = require('./tokenValidators.testHelpers');

/**
 * Tests para validación case-insensitive
 */
function runCaseInsensitiveTests() {
  test('should accept case-insensitive match for country_code', () => {
    const params = buildRouteParams('es', 'ABC', 'token-123');
    const body = buildValidTokenData('ES', 'ABC', 'token-123');

    const result = runTokenValidation(params, body);
    expect(result.valid).toBe(true);
  });

  test('should accept case-insensitive match for party_id', () => {
    const params = buildRouteParams('ES', 'abc', 'token-123');
    const body = buildValidTokenData('ES', 'ABC', 'token-123');

    const result = runTokenValidation(params, body);
    expect(result.valid).toBe(true);
  });
}

module.exports = {
    runCaseInsensitiveTests
};

