/**
 * Utilidades para sanitizar URLs y evitar problemas con barras dobles
 */

/**
 * Sanitiza una URL eliminando barras finales y asegurando formato correcto
 * @param {string} url - URL a sanitizar
 * @returns {string} URL sanitizada sin barras finales
 */
function sanitizeUrl(url) {
  if (!url) {
    return url;
  }

  // Eliminar barras finales
  return url.replace(/\/+$/, '');
}

/**
 * Construye una URL completa concatenando una URL base con una ruta
 * Maneja correctamente las barras para evitar dobles barras
 * @param {string} baseUrl - URL base
 * @param {string} path - Ruta a concatenar (debe empezar con /)
 * @returns {string} URL completa
 */
function buildUrl(baseUrl, path) {
  if (!baseUrl || !path) {
    return baseUrl || path;
  }

  const sanitizedBase = sanitizeUrl(baseUrl);
  // Asegurar que el path empiece con /
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${sanitizedBase}${sanitizedPath}`;
}

module.exports = {
  sanitizeUrl,
  buildUrl
};

