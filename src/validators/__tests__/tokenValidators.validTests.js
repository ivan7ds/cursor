const {
  testAllTokenTypes,
  testAllWhitelistTypes,
  testAllProfileTypes
} = require('./tokenValidators.testHelpers');
const { runTokenValidation } = require('./tokenValidators.testHelpers');
const {
  testCompleteValidToken,
  testMinimalValidToken,
  testTokenWithFractionalSeconds
} = require('./tokenValidators.validTestHelpers');

/**
 * Tests para datos de token válidos
 */
function runValidTokenTests() {
  test('should validate complete valid token with all fields', testCompleteValidToken);
  test('should validate minimal valid token (only required fields)', testMinimalValidToken);
  test('should validate token with fractional seconds in timestamp', testTokenWithFractionalSeconds);

  test('should validate all token types', () => {
    testAllTokenTypes((params, body) => {
      const result = runTokenValidation(params, body);
      expect(result.valid).toBe(true);
    });
  });

  test('should validate all whitelist types', () => {
    testAllWhitelistTypes((params, body) => {
      const result = runTokenValidation(params, body);
      expect(result.valid).toBe(true);
    });
  });

  test('should validate all profile types', () => {
    testAllProfileTypes((params, body) => {
      const result = runTokenValidation(params, body);
      expect(result.valid).toBe(true);
    });
  });
}

module.exports = {
    runValidTokenTests
};

