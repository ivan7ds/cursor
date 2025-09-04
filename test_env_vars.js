// Script de prueba para verificar variables de entorno
require('dotenv').config();

console.log('🔍 Verificando variables de entorno OCPI:');
console.log('OCPI_PARTY_ID:', process.env.OCPI_PARTY_ID || 'IPD (default)');
console.log('OCPI_COUNTRY_CODE:', process.env.OCPI_COUNTRY_CODE || 'ES (default)');
console.log('OCPI_VERSION:', process.env.OCPI_VERSION || '2.2 (default)');

// Simular construcción de URL como en el código
const partyId = process.env.OCPI_PARTY_ID || 'IPD';
const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
const version = process.env.OCPI_VERSION || '2.2';

console.log('\n🌐 URLs generadas:');
console.log('URL de notificación:', `https://example.com/ocpi/emsp/${version}/locations/${countryCode}/${partyId}/location123/evse456`);
console.log('User-Agent:', `${partyId}-CPO-OCPI-${version}`);

console.log('\n✅ Variables de entorno funcionando correctamente');
