/**
 * OCPI 2.2 Location Validators
 * According to OCPI 2.2 specification - Locations Module
 * 
 * Este archivo re-exporta todos los esquemas y funciones de validación
 * desde módulos más pequeños para mantener compatibilidad con código existente.
 */

// Importar enums
const basicSchemas = require('./locationValidators/basicSchemas');
const enums = require('./locationValidators/enums');

// Importar esquemas básicos

// Importar esquemas de horarios
const evseSchemas = require('./locationValidators/evseSchemas');
const hoursSchemas = require('./locationValidators/hoursSchemas');

// Importar esquemas de EVSE

// Importar esquemas de Location
const locationSchemas = require('./locationValidators/locationSchemas');

// Importar funciones de validación
const validationFunctions = require('./locationValidators/validationFunctions');

// Re-exportar todo para mantener compatibilidad
module.exports = {
  // Esquemas principales
  locationPutBodySchema: locationSchemas.locationPutBodySchema,
  locationPatchBodySchema: locationSchemas.locationPatchBodySchema,
  locationPathSchema: locationSchemas.locationPathSchema,
  evseSchema: evseSchemas.evseSchema,
  connectorSchema: evseSchemas.connectorSchema,

  // Funciones de validación
  validateLocationPut: validationFunctions.validateLocationPut,
  validateLocationPutMiddleware: validationFunctions.validateLocationPutMiddleware,
  validateLocationPatch: validationFunctions.validateLocationPatch,
  validateLocationPatchMiddleware: validationFunctions.validateLocationPatchMiddleware,

  // Enums
  STATUSES: enums.STATUSES,
  CAPABILITIES: enums.CAPABILITIES,
  CONNECTOR_TYPES: enums.CONNECTOR_TYPES,
  CONNECTOR_FORMATS: enums.CONNECTOR_FORMATS,
  POWER_TYPES: enums.POWER_TYPES,
  PARKING_TYPES: enums.PARKING_TYPES,
  PARKING_RESTRICTIONS: enums.PARKING_RESTRICTIONS,
  FACILITIES: enums.FACILITIES,
  IMAGE_CATEGORIES: enums.IMAGE_CATEGORIES
};
