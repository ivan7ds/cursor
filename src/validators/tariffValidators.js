/**
 * OCPI 2.2 Tariff Validators
 * According to OCPI 2.2 specification - Tariffs Module
 * 
 * Este archivo re-exporta todos los esquemas y funciones de validación
 * desde módulos más pequeños para mantener compatibilidad con código existente.
 */

// Importar enums

// Importar esquemas básicos
const basicSchemas = require('./tariffValidators/basicSchemas');

// Importar esquemas de tarifas

// Importar esquemas de energía
const energySchemas = require('./tariffValidators/energySchemas');
const enums = require('./tariffValidators/enums');

// Importar esquemas de Tariff body
const tariffBodySchemas = require('./tariffValidators/tariffBodySchemas');
const tariffSchemas = require('./tariffValidators/tariffSchemas');

// Importar funciones de validación
const validationFunctions = require('./tariffValidators/validationFunctions');

// Re-exportar todo para mantener compatibilidad
module.exports = {
  // Esquemas principales
  tariffPutBodySchema: tariffBodySchemas.tariffPutBodySchema,
  tariffPatchBodySchema: tariffBodySchemas.tariffPatchBodySchema,
  tariffPutPathSchema: tariffBodySchemas.tariffPutPathSchema,
  tariffElementSchema: tariffSchemas.tariffElementSchema,
  priceComponentSchema: tariffSchemas.priceComponentSchema,
  tariffRestrictionsSchema: tariffSchemas.tariffRestrictionsSchema,
  energyMixSchema: energySchemas.energyMixSchema,
  energySourceSchema: energySchemas.energySourceSchema,
  environmentalImpactSchema: energySchemas.environmentalImpactSchema,

  // Funciones de validación
  validateTariffPut: validationFunctions.validateTariffPut,
  validateTariffPutMiddleware: validationFunctions.validateTariffPutMiddleware,
  validateTariffPatch: validationFunctions.validateTariffPatch,
  validateTariffPatchMiddleware: validationFunctions.validateTariffPatchMiddleware,

  // Enums
  TARIFF_TYPES: enums.TARIFF_TYPES,
  TARIFF_DIMENSION_TYPES: enums.TARIFF_DIMENSION_TYPES,
  DAYS_OF_WEEK: enums.DAYS_OF_WEEK,
  RESERVATION_RESTRICTION_TYPES: enums.RESERVATION_RESTRICTION_TYPES,
  ENERGY_SOURCE_CATEGORIES: enums.ENERGY_SOURCE_CATEGORIES,
  ENVIRONMENTAL_IMPACT_CATEGORIES: enums.ENVIRONMENTAL_IMPACT_CATEGORIES
};
