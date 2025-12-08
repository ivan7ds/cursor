#!/usr/bin/env node

/**
 * Script para verificar las organizaciones configuradas para notificaciones
 * Muestra todas las credenciales válidas que recibirán notificaciones
 */

require('dotenv').config();
const { sequelize } = require('../src/database/connection');
const logger = require('../src/utils/logger');

async function checkOrganizations() {
    try {
        console.log('🔍 Verificando organizaciones configuradas...\n');
        
        const ourPartyId = process.env.OCPI_PARTY_ID || 'IPD';
        console.log(`📋 Nuestro party_id: ${ourPartyId}\n`);
        
        // Obtener todas las credenciales
        const allCredentials = await sequelize.query(`
            SELECT 
                id,
                party_id,
                country_code,
                url,
                valid,
                temp,
                token_base64_encoded,
                created_at,
                last_updated
            FROM credentials
            ORDER BY party_id, country_code
        `, {
            type: sequelize.QueryTypes.SELECT
        });
        
        const credentialsArray = Array.isArray(allCredentials) ? allCredentials : (allCredentials[0] || []);
        
        console.log(`📊 Total de credenciales en la base de datos: ${credentialsArray.length}\n`);
        
        if (credentialsArray.length === 0) {
            console.log('⚠️ No hay credenciales en la base de datos.\n');
            return;
        }
        
        // Mostrar todas las credenciales
        console.log('📋 Todas las credenciales:');
        console.log('─'.repeat(100));
        credentialsArray.forEach((cred, index) => {
            const isOurs = cred.party_id === ourPartyId;
            const status = cred.valid ? '✅ Válida' : '❌ Inválida';
            const tempStatus = cred.temp ? ' (Temporal)' : ' (Permanente)';
            console.log(`${index + 1}. ${cred.party_id}_${cred.country_code} - ${status}${tempStatus}`);
            console.log(`   URL: ${cred.url}`);
            console.log(`   ID: ${cred.id}`);
            console.log(`   Creada: ${cred.created_at}`);
            console.log(`   Actualizada: ${cred.last_updated}`);
            if (isOurs) {
                console.log(`   ⚠️ Esta es nuestra propia credencial (no recibirá notificaciones)`);
            }
            console.log('');
        });
        
        // Obtener organizaciones que recibirán notificaciones
        const organizationsResult = await sequelize.query(`
            SELECT DISTINCT
                party_id,
                country_code,
                token,
                url,
                token_base64_encoded
            FROM credentials
            WHERE valid = true
            AND party_id != :ourPartyId
            ORDER BY party_id, country_code
        `, {
            replacements: {
                ourPartyId
            },
            type: sequelize.QueryTypes.SELECT
        });
        
        const organizations = Array.isArray(organizationsResult) ? organizationsResult : (organizationsResult[0] || []);
        
        console.log('─'.repeat(100));
        console.log(`\n📤 Organizaciones que recibirán notificaciones: ${organizations.length}\n`);
        
        if (organizations.length === 0) {
            console.log('⚠️ No hay organizaciones configuradas para recibir notificaciones.');
            console.log('   Para que una organización reciba notificaciones, debe:');
            console.log('   1. Tener valid = true en la tabla credentials');
            console.log('   2. Tener party_id diferente a nuestro party_id (' + ourPartyId + ')');
            console.log('   3. Tener url y token configurados\n');
        } else {
            console.log('✅ Organizaciones que recibirán notificaciones:');
            organizations.forEach((org, index) => {
                console.log(`   ${index + 1}. ${org.party_id}_${org.country_code}`);
                console.log(`      URL: ${org.url}`);
                console.log(`      Token Base64: ${org.token_base64_encoded ? 'Sí' : 'No'}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando organizaciones:', error);
        logger.error('Error verificando organizaciones:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar el script
checkOrganizations()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error ejecutando verificación:', error);
        process.exit(1);
    });

