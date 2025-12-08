/**
 * Fixtures de datos para tests de Tariffs
 */

/**
 * Tariff básica válida según OCPI 2.2
 */
const basicTariff = {
  id: 'TARIFF_TEST_001',
  currency: 'EUR',
  type: 'REGULAR',
  elements: [
    {
      price_components: [
        {
          type: 'ENERGY',
          price: 0.20,
          step_size: 1
        }
      ]
    }
  ],
  last_updated: new Date().toISOString()
};

/**
 * Tariff completa con todos los campos opcionales
 */
const completeTariff = {
  ...basicTariff,
  id: 'TARIFF_TEST_002',
  currency: 'EUR',
  type: 'REGULAR',
  elements: [
    {
      price_components: [
        {
          type: 'ENERGY',
          price: 0.25,
          step_size: 1,
          vat: 10
        },
        {
          type: 'TIME',
          price: 0.05,
          step_size: 300,
          vat: 10
        }
      ],
      restrictions: {
        start_time: '09:00',
        end_time: '18:00',
        min_kwh: 5,
        max_kwh: 50
      }
    }
  ],
  tariff_alt_text: [
    {
      language: 'es',
      text: 'Tarifa de prueba completa'
    }
  ],
  tariff_alt_url: 'https://example.com/tariff-info',
  min_price: 1.00,
  max_price: 100.00,
  start_date_time: new Date().toISOString(),
  end_date_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  last_updated: new Date().toISOString()
};

/**
 * Tariff con horarios específicos
 */
const tariffWithHours = {
  ...basicTariff,
  id: 'TARIFF_TEST_003',
  elements: [
    {
      price_components: [
        {
          type: 'ENERGY',
          price: 0.15,
          step_size: 1
        }
      ],
      restrictions: {
        day_of_week: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        start_time: '00:00',
        end_time: '23:59'
      }
    }
  ]
};

/**
 * Tariff inválida (faltan campos requeridos)
 */
const invalidTariff = {
  id: 'TARIFF_INVALID'
  // Faltan campos requeridos: currency, type, elements
};

module.exports = {
  basicTariff,
  completeTariff,
  tariffWithHours,
  invalidTariff
};

