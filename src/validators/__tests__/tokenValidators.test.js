const { runCaseInsensitiveTests } = require('./tokenValidators.caseTests');
const { runInvalidTokenTests } = require('./tokenValidators.invalidTests');
const { runValidTokenTests } = require('./tokenValidators.validTests');

describe('Token PUT Validator', () => {
  describe('Valid Token Data', () => {
    runValidTokenTests();
  });

  describe('Invalid Token Data', () => {
    runInvalidTokenTests();
  });

  describe('Case Insensitive Validation', () => {
    runCaseInsensitiveTests();
  });
});
