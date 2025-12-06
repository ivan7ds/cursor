const {
  testMissingRequiredField,
  testInvalidType,
  testCountryCodeExceedsMaxLength,
  testUidMismatch,
  testTimestampWithTimezoneOffset,
  testInvalidLanguageCode,
  testMissingSupplierName,
  testNonPrintableCharacters
} = require('./tokenValidators.invalidTestHelpers');

/**
 * Tests para datos de token inválidos
 */
function runInvalidTokenTests() {
  test('should fail when required field is missing (type)', testMissingRequiredField);
  test('should fail when type is invalid', testInvalidType);
  test('should fail when country_code exceeds max length', testCountryCodeExceedsMaxLength);
  test('should fail when uid in path does not match body', testUidMismatch);
  test('should fail when timestamp has timezone offset', testTimestampWithTimezoneOffset);
  test('should fail when language code is invalid', testInvalidLanguageCode);
  test('should fail when energy_contract is missing required supplier_name', testMissingSupplierName);
  test('should fail when string contains non-printable characters', testNonPrintableCharacters);
}

module.exports = {
    runInvalidTokenTests
};

