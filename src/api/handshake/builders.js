const { URL } = require('url');

/**
 * Construye la URL de details desde el endpoint
 * @param {string} detailsEndpoint - Endpoint recibido
 * @param {string} sanitizedUrl - URL base sanitizada
 * @returns {string} URL completa de details
 */
function buildDetailsUrl(detailsEndpoint, sanitizedUrl) {
  let detailsUrl;
  console.log('🔍 Endpoint recibido:', detailsEndpoint);

  if (detailsEndpoint.includes('/ocpi/cpo/2.2/details') || detailsEndpoint.includes('/ocpi/2.2/details')) {
    detailsUrl = detailsEndpoint;
    console.log('🔗 Endpoint ya incluye ruta completa:', detailsUrl);
  } else {
    detailsUrl = `${detailsEndpoint.replace(/\/$/, '')}/ocpi/cpo/2.2/details`;
    console.log('🔗 Construyendo URL desde endpoint base:', detailsUrl);
  }

  // Reemplazar localhost por la IP del host si es necesario (para Docker)
  if (detailsUrl.includes('localhost')) {
    const originalUrl = new URL(sanitizedUrl);
    const hostname = originalUrl.hostname;
    detailsUrl = detailsUrl.replace('localhost', hostname);
    console.log('🔧 Reemplazando localhost por IP del host:', detailsUrl);
  }

  return detailsUrl;
}

/**
 * Construye el payload de credenciales para enviar
 * @param {Object} ourCredentials - Nuestras credenciales
 * @returns {Object} Payload de credenciales
 */
function buildCredentialsPayload(ourCredentials) {
  return {
    token: ourCredentials.token,
    url: `${ourCredentials.url}/ocpi/versions`,
    roles: [
      {
        role: 'CPO',
        party_id: ourCredentials.party_id,
        country_code: ourCredentials.country_code,
        business_details: {
          name: ourCredentials.business_details.name,
          website: ourCredentials.url
        }
      },
      {
        role: 'EMSP',
        party_id: ourCredentials.party_id,
        country_code: ourCredentials.country_code,
        business_details: {
          name: ourCredentials.business_details.name,
          website: ourCredentials.url
        }
      }
    ]
  };
}

/**
 * Construye la URL de credentials desde el endpoint de details
 * @param {Object} detailsData - Datos de la respuesta de details
 * @param {string} detailsEndpoint - Endpoint de details original
 * @param {string} sanitizedUrl - URL base sanitizada
 * @returns {string} URL de credentials
 */
function buildCredentialsUrl(detailsData, detailsEndpoint, sanitizedUrl) {
  let credentialsUrl;
  const credentialsEndpoint = detailsData.endpoints?.find(ep => ep.identifier === 'credentials' && ep.role === 'SENDER');

  if (credentialsEndpoint && credentialsEndpoint.url) {
    credentialsUrl = credentialsEndpoint.url;
    console.log('🔗 Usando endpoint de credentials de la respuesta de details:', credentialsUrl);
  } else {
    console.log('🔍 Endpoint para credentials (fallback):', detailsEndpoint);

    if (detailsEndpoint.includes('/ocpi/cpo/2.2/details') || detailsEndpoint.includes('/ocpi/2.2/details')) {
      if (detailsEndpoint.includes('/ocpi/cpo/2.2/details')) {
        credentialsUrl = detailsEndpoint.replace('/ocpi/cpo/2.2/details', '/ocpi/cpo/2.2/credentials');
      } else if (detailsEndpoint.includes('/ocpi/2.2/details')) {
        credentialsUrl = detailsEndpoint.replace('/ocpi/2.2/details', '/ocpi/2.2/credentials');
      }
      console.log('🔗 Construyendo URL de credentials desde endpoint completo:', credentialsUrl);
    } else {
      credentialsUrl = `${detailsEndpoint.replace(/\/$/, '')}/ocpi/2.2/credentials`;
      console.log('🔗 Construyendo URL de credentials desde endpoint base:', credentialsUrl);
    }
  }

  // Reemplazar localhost por la IP del host si es necesario (para Docker)
  if (credentialsUrl.includes('localhost')) {
    const originalUrl = new URL(sanitizedUrl);
    const hostname = originalUrl.hostname;
    credentialsUrl = credentialsUrl.replace('localhost', hostname);
    console.log('🔧 Reemplazando localhost por IP del host en credentials:', credentialsUrl);
  }

  return credentialsUrl;
}

/**
 * Construye la respuesta exitosa del handshake
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @param {Object} credentialsResponse - Respuesta de credentials
 * @param {Array} operatorEndpoints - Endpoints del operador
 * @returns {Object} Respuesta JSON
 */
function buildSuccessResponse(partyId, countryCode, credentialsResponse, operatorEndpoints) {
  return {
    status_code: 1000,
    status_message: 'OCPI 2.2.1 handshake completed successfully',
    data: {
      party_id: partyId,
      country_code: countryCode,
      token: credentialsResponse.data.data.token,
      endpoints: operatorEndpoints
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Construye la respuesta cuando las credenciales son rechazadas
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @param {string} sanitizedUrl - URL sanitizada
 * @param {Object} ourCredentials - Nuestras credenciales
 * @returns {Object} Respuesta JSON
 */
function buildRejectedCredentialsResponse(partyId, countryCode, sanitizedUrl, ourCredentials) {
  return {
    status_code: 1000,
    status_message: 'Credentials rejected by external organization. Waiting for external handshake initiation.',
    data: {
      message: 'El operador externo rechazó nuestras credenciales. Ahora él iniciará el handshake hacia nuestra aplicación.',
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      our_endpoints: {
        versions: `${ourCredentials.url}/ocpi/versions`,
        details: `${ourCredentials.url}/ocpi/cpo/2.2/details`,
        credentials: `${ourCredentials.url}/ocpi/cpo/2.2/credentials`
      },
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      external_organization: {
        party_id: partyId,
        country_code: countryCode,
        url: sanitizedUrl
      }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Construye la respuesta exitosa de generación de credenciales
 * @param {Object} params - Parámetros de construcción
 * @param {string} params.partyId - Party ID
 * @param {string} params.countryCode - Country code
 * @param {string} params.url - URL de la organización externa
 * @param {string} params.initialToken - Token inicial generado
 * @param {Object} params.ourCredentials - Nuestras credenciales
 * @returns {Object} Respuesta JSON
 */
function buildGenerateCredentialsResponse({ partyId, countryCode, url, initialToken, ourCredentials }) {
  return {
    status_code: 1000,
    status_message: 'Initial token generated successfully for handshake',
    data: {
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      our_credentials: {
        url: ourCredentials.url,
        token: initialToken,
        party_id: ourCredentials.party_id,
        country_code: ourCredentials.country_code,
        business_details: ourCredentials.business_details,
        last_updated: new Date().toISOString()
      },
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      external_organization: {
        party_id: partyId,
        country_code: countryCode,
        url
      },
      instructions: {
        message: 'Use the provided token to initiate handshake with the external organization',
        // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
        next_step: 'Use the "Connect to External Organization" button to complete the handshake'
      }
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    buildDetailsUrl,
    buildCredentialsPayload,
    buildCredentialsUrl,
    buildSuccessResponse,
    buildRejectedCredentialsResponse,
    buildGenerateCredentialsResponse
};

