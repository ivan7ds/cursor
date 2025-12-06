/**
 * OCPI 2.2 CDR Validators
 * According to OCPI 2.2 specification - CDRs Module
 * 
 * Este archivo re-exporta todos los esquemas y funciones de validación
 * desde módulos más pequeños para mantener compatibilidad con código existente.
 */

// Importar enums
const basicSchemas = require('./cdrValidators/basicSchemas');
const cdrSchemas = require('./cdrValidators/cdrSchemas');
const energySchemas = require('./cdrValidators/energySchemas');
const enums = require('./cdrValidators/enums');

// Importar esquemas básicos

// Importar esquemas de energía

// Importar esquemas de tarifas
const tariffSchemas = require('./cdrValidators/tariffSchemas');

// Importar esquemas de CDR

// Importar funciones de validación
const validationFunctions = require('./cdrValidators/validationFunctions');

// Re-exportar todo para mantener compatibilidad
module.exports = {
  // Esquemas principales
  cdrPostBodySchema: cdrSchemas.cdrPostBodySchema,
  cdrTokenSchema: basicSchemas.cdrTokenSchema,
  cdrLocationSchema: basicSchemas.cdrLocationSchema,
  priceSchema: basicSchemas.priceSchema,
  tariffSchema: tariffSchemas.tariffSchema,
  chargingPeriodSchema: cdrSchemas.chargingPeriodSchema,
  signedDataSchema: cdrSchemas.signedDataSchema,

  // Funciones de validación
  validateCdrPost: validationFunctions.validateCdrPost,
  validateCdrPostMiddleware: validationFunctions.validateCdrPostMiddleware,
  validateCdrResponse: validationFunctions.validateCdrResponse,
  validateCdrsResponse: validationFunctions.validateCdrsResponse,
  validateCdrGetResponseMiddleware: validationFunctions.validateCdrGetResponseMiddleware,

  // Enums
  TOKEN_TYPES: enums.TOKEN_TYPES,
  AUTH_METHODS: enums.AUTH_METHODS,
  CONNECTOR_TYPES: enums.CONNECTOR_TYPES,
  CONNECTOR_FORMATS: enums.CONNECTOR_FORMATS,
  POWER_TYPES: enums.POWER_TYPES,
  TARIFF_TYPES: enums.TARIFF_TYPES,
  TARIFF_DIMENSION_TYPES: enums.TARIFF_DIMENSION_TYPES
};
