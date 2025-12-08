/**
 * Sanitiza una URL eliminando barras finales para evitar dobles barras al concatenar
 * @param {string} url - URL a sanitizar
 * @returns {string} URL sin barras finales
 */
function sanitizeUrl(url) {
  if (!url) return url;
  return url.replace(/\/$/, '');
}

/**
 * Construye la URL del endpoint del eMSP
 */
function buildEMSPEndpointURL(emsp, evseChange, service) {
  const baseUrl = service.sanitizeUrl(emsp.url.replace('/ocpi/versions', ''));

  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseChange.location_id}/${evseChange.evse_uid}`;
}

module.exports = {
    sanitizeUrl,
    buildEMSPEndpointURL
};

