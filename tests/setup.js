/**
 * Configuración global para tests
 * Este archivo se ejecuta antes de cada test suite
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.OCPI_PARTY_ID = 'TEST';
process.env.OCPI_COUNTRY_CODE = 'ES';
process.env.OCPI_VERSION = '2.2';
process.env.OCPI_TOKEN = 'test_token_12345';

// Suprimir logs durante los tests (opcional, comentar si necesitas ver logs)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Descomentar para suprimir logs en tests
// console.log = () => {};
// console.error = () => {};
// console.warn = () => {};

// Restaurar console después de los tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Timeout global para tests
jest.setTimeout(10000);

