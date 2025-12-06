const logger = require('../../../utils/logger');

/**
 * Construye la respuesta cuando no hay organizaciones externas
 * @returns {Object} Respuesta JSON
 */
function buildNoOrganizationsResponse() {
  return {
    status_code: 1000,
    data: [],
    message: 'No hay organizaciones externas conectadas',
    timestamp: new Date().toISOString()
  };
}

/**
 * Maneja el procesamiento de datos de una organización
 * @param {Object} params - Parámetros de procesamiento
 * @param {Object} params.org - Organización externa
 * @param {Function} params.fetchFunction - Función para obtener datos de la organización
 * @param {Function} params.processFunction - Función para procesar los datos
 * @param {Array} params.allData - Array acumulativo de todos los datos
 * @param {Array} params.errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount
 */
async function processOrganizationData({ org, fetchFunction, processFunction, allData, errors }) {
  try {
    const data = await fetchFunction(org);
    if (data && data.length > 0) {
      return await processFunction(data, org, allData, errors);
    }
    return { savedCount: 0, duplicateCount: 0 };
  } catch (orgError) {
    const error = `Error consultando ${org.party_id}: ${orgError.message}`;
    errors.push(error);
    logger.error(`❌ ${error}`);
    return { savedCount: 0, duplicateCount: 0 };
  }
}

/**
 * Procesa todas las organizaciones y acumula resultados
 * @param {Object} params - Parámetros de procesamiento
 * @param {Array} params.organizations - Array de organizaciones
 * @param {Function} params.fetchFunction - Función para obtener datos
 * @param {Function} params.processFunction - Función para procesar datos
 * @param {Array} params.allData - Array acumulativo
 * @param {Array} params.errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount totales
 */
async function processAllOrganizations({ organizations, fetchFunction, processFunction, allData, errors }) {
  // Crear promesas para procesar todas las organizaciones en paralelo
  const orgPromises = organizations.map(org => 
    processOrganizationData({ org, fetchFunction, processFunction, allData, errors })
  );

  // Ejecutar todas las promesas y sumar resultados
  const results = await Promise.allSettled(orgPromises);
  
  let savedCount = 0;
  let duplicateCount = 0;
  
  results.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      savedCount += settledResult.value.savedCount;
      duplicateCount += settledResult.value.duplicateCount;
    }
  });

  return { savedCount, duplicateCount };
}

module.exports = {
    buildNoOrganizationsResponse,
    processAllOrganizations
};

