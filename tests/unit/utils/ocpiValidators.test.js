/**
 * Tests unitarios para ocpiValidators
 */

const { ciString, dateTime, ocpiString, ocpiNumber, languageCode } = require('../../../src/utils/ocpiValidators');
const Joi = require('joi');

describe('OCPI Validators', () => {
  describe('ciString', () => {
    it('debe aceptar strings válidos', () => {
      const schema = ciString(100);
      const { error, value } = schema.validate('TestString');
      expect(error).toBeUndefined();
      expect(value).toBe('TestString');
    });

    it('debe aceptar strings en mayúsculas', () => {
      const schema = ciString(100);
      const { error, value } = schema.validate('TESTSTRING');
      expect(error).toBeUndefined();
      // ciString no convierte automáticamente, solo valida formato
      expect(value).toBe('TESTSTRING');
    });

    it('debe rechazar valores no string', () => {
      const schema = ciString(100);
      const { error } = schema.validate(123);
      expect(error).toBeDefined();
    });

    it('debe rechazar strings que exceden el límite', () => {
      const schema = ciString(5);
      const { error } = schema.validate('123456');
      expect(error).toBeDefined();
    });
  });

  describe('dateTime', () => {
    it('debe aceptar fechas ISO 8601 válidas', () => {
      const schema = dateTime();
      const validDate = new Date().toISOString();
      const { error, value } = schema.validate(validDate);
      expect(error).toBeUndefined();
      expect(value).toBe(validDate);
    });

    it('debe rechazar fechas inválidas', () => {
      const schema = dateTime();
      const { error } = schema.validate('invalid-date');
      expect(error).toBeDefined();
    });

    it('debe rechazar valores no string', () => {
      const schema = dateTime();
      const { error } = schema.validate(1234567890);
      expect(error).toBeDefined();
    });
  });

  describe('ocpiString', () => {
    it('debe aceptar strings dentro del límite', () => {
      const schema = ocpiString(10);
      const { error, value } = schema.validate('1234567890');
      expect(error).toBeUndefined();
      expect(value).toBe('1234567890');
    });

    it('debe rechazar strings que exceden el límite', () => {
      const schema = ocpiString(5);
      const { error } = schema.validate('123456');
      expect(error).toBeDefined();
    });

    it('debe rechazar caracteres de control', () => {
      const schema = ocpiString(100);
      const { error } = schema.validate('test\x00control');
      expect(error).toBeDefined();
    });
  });

  describe('ocpiNumber', () => {
    it('debe aceptar números válidos', () => {
      const schema = ocpiNumber();
      const { error, value } = schema.validate(123.4567);
      expect(error).toBeUndefined();
      expect(value).toBe(123.4567);
    });

    it('debe rechazar valores no numéricos', () => {
      const schema = ocpiNumber();
      const { error } = schema.validate('not-a-number');
      expect(error).toBeDefined();
    });
  });

  describe('languageCode', () => {
    it('debe aceptar códigos ISO 639-1 válidos', () => {
      const schema = languageCode();
      const { error, value } = schema.validate('es');
      expect(error).toBeUndefined();
      expect(value).toBe('es');
    });

    it('debe rechazar códigos inválidos', () => {
      const schema = languageCode();
      const { error } = schema.validate('invalid');
      expect(error).toBeDefined();
    });

    it('debe rechazar códigos de más de 2 caracteres', () => {
      const schema = languageCode();
      const { error } = schema.validate('esp');
      expect(error).toBeDefined();
    });
  });
});

